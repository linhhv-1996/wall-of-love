// server/api/projects.post.ts
import { serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'
import slugify from 'slugify'
import { randomBytes } from 'crypto' // Để tạo suffix ngẫu nhiên cho slug

// Định nghĩa kiểu cho dữ liệu trả về (có thể mở rộng)
type NewProjectResponse = Pick<Database['public']['Tables']['projects']['Row'], 'project_id' | 'name' | 'slug' | 'logo_url'>

export default defineEventHandler(async (event): Promise<NewProjectResponse> => {
  // 1. Xác thực người dùng
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const userId = user.sub

  // 2. Đọc dữ liệu multipart/form-data
  const formData = await readMultipartFormData(event)
  const nameEntry = formData?.find(entry => entry.name === 'name')
  const logoEntry = formData?.find(entry => entry.name === 'logo')

  const projectName = nameEntry?.data.toString().trim()

  // 3. Validate tên project
  if (!projectName) {
    throw createError({ statusCode: 400, statusMessage: 'Project name is required.' })
  }
  if (projectName.length > 100) {
     throw createError({ statusCode: 400, statusMessage: 'Project name cannot exceed 100 characters.' })
  }

  // 4. Lấy Supabase Admin Client
  const supabaseAdmin = useSupabaseAdmin()

  // 5. Tạo slug duy nhất
  let projectSlug = slugify(projectName, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  if (!projectSlug) {
      projectSlug = `project-${randomBytes(4).toString('hex')}`
  }

  let isSlugUnique = false;
  let attempt = 0;
  const maxAttempts = 5;
  let finalSlug = projectSlug;

  while (!isSlugUnique && attempt < maxAttempts) {
    const { data: existingSlug, error: slugCheckError } = await supabaseAdmin
      .from('projects')
      .select('slug')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (slugCheckError) {
      console.error(`API Create Project: Error checking slug uniqueness (attempt ${attempt + 1}):`, slugCheckError.message);
      throw createError({ statusCode: 500, statusMessage: 'Could not verify project slug uniqueness.' });
    }

    if (!existingSlug) {
      isSlugUnique = true;
    } else {
      attempt++;
      finalSlug = `${projectSlug}-${randomBytes(3).toString('hex')}`;
      console.log(`API Create Project: Slug collision detected. Retrying with: ${finalSlug}`);
    }
  }

  if (!isSlugUnique) {
      console.error(`API Create Project: Could not generate a unique slug for "${projectName}" after ${maxAttempts} attempts.`);
      throw createError({ statusCode: 500, statusMessage: 'Could not generate a unique project slug.' });
  }

  // 6. Xử lý upload logo (nếu có)
  let logoPublicUrl: string | null = null;
  let logoFilePath: string | null = null;
  const bucketName = 'project-logos';

  if (logoEntry && logoEntry.data.length > 0) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!logoEntry.type || !allowedTypes.includes(logoEntry.type)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid logo file type. Only PNG, JPG, SVG are allowed.' });
    }
    if (logoEntry.data.length > maxSize) {
      throw createError({ statusCode: 400, statusMessage: 'Logo file size exceeds 2MB limit.' });
    }

    const fileExtension = logoEntry.filename?.split('.').pop()?.toLowerCase() || 'png'; // Lấy đuôi file hoặc mặc định là png
    const logoFileName = `logo-${randomBytes(6).toString('hex')}.${fileExtension}`;
    logoFilePath = `public/${userId}/${finalSlug}/${logoFileName}`; // Đường dẫn trong storage

    console.log(`API Create Project: Uploading logo to bucket "${bucketName}" at path: ${logoFilePath}`);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(logoFilePath, logoEntry.data, {
        contentType: logoEntry.type,
        upsert: false // Không ghi đè nếu file đã tồn tại (ít khả năng xảy ra với tên ngẫu nhiên)
      });

    if (uploadError) {
      console.error('API Create Project: Error uploading logo:', uploadError.message);
      throw createError({ statusCode: 500, statusMessage: `Failed to upload logo: ${uploadError.message}` });
    }

    // Lấy public URL sau khi upload thành công
    const { data: urlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(logoFilePath);

    if (!urlData?.publicUrl) {
         console.warn(`API Create Project: Could not get public URL for uploaded logo at ${logoFilePath}.`);
         // Không throw lỗi, nhưng logo_url sẽ là null
    } else {
        logoPublicUrl = urlData.publicUrl;
        console.log(`API Create Project: Logo uploaded successfully. Public URL: ${logoPublicUrl}`);
    }

  } else {
      console.log('API Create Project: No logo file provided.');
  }

  // 7. Insert project vào database
  console.log(`API Create Project: Inserting project "${projectName}" with slug "${finalSlug}" for user ${userId}`);
  const { data: newProjectData, error: insertError } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: userId,
      name: projectName,
      slug: finalSlug,
      logo_url: logoPublicUrl,
    })
    .select('project_id, name, slug, logo_url')
    .single();

  if (insertError || !newProjectData) {
    console.error('API Create Project: Error inserting project:', insertError?.message);
    // Thử xóa logo đã upload nếu insert thất bại
    if (logoPublicUrl && logoFilePath) {
        console.warn(`API Create Project: Rolling back logo upload: ${logoFilePath}`);
        await supabaseAdmin.storage.from(bucketName).remove([logoFilePath]);
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to create project in database: ${insertError?.message || 'Unknown error'}` });
  }

  console.log(`API Create Project: Project created successfully with ID: ${newProjectData.project_id}`);

  // 8. Trả về dữ liệu project mới tạo (status 201 Created)
  setResponseStatus(event, 201);
  return newProjectData;
})
