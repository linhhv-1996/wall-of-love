// server/api/projects/create.post.ts
import { serverSupabaseUser } from '#supabase/server';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  // 1. Vẫn dùng `serverSupabaseUser` để biết user nào đang gọi API
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  // Lấy thông tin từ form data
  const formData = await readMultipartFormData(event);
  const projectName = formData?.find(el => el.name === 'projectName')?.data.toString('utf-8');
  const logoFile = formData?.find(el => el.name === 'logo');

  if (!projectName || !logoFile) {
    throw createError({ statusCode: 400, message: 'Project name and logo are required.' });
  }

  // 2. Tạo một SUPER CLIENT bằng SERVICE KEY
  // Client này có toàn quyền admin và sẽ bỏ qua tất cả RLS
  const adminSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // 3. Upload logo vẫn dùng client admin này
  const fileExt = logoFile.filename?.split('.').pop();
  const filePath = `${user.id}/${nanoid()}.${fileExt}`;

  const { error: uploadError } = await adminSupabase.storage
    .from('project-logos')
    .upload(filePath, logoFile.data, { contentType: logoFile.type });

  if (uploadError) {
    throw createError({ statusCode: 500, message: uploadError.message });
  }

  const { data: { publicUrl: logoUrl } } = adminSupabase.storage.from('project-logos').getPublicUrl(filePath);

  // ... Logic gọi Bunny.net API của bạn ...
  const uniqueProjectSlug = slugify(`${projectName}-${nanoid(6)}`, { lower: true, strict: true });
  const placeholderBunnyStorageId = 12345;
  const placeholderBunnyHostname = `${uniqueProjectSlug}.b-cdn.net`;

  // 4. Dùng client ADMIN để INSERT thẳng vào database
  // Nó sẽ không cần quan tâm đến RLS nữa.
  const { data: newProject, error: insertError } = await adminSupabase
    .from('projects')
    .insert({
      user_id: user.sub,
      name: projectName,
      slug: uniqueProjectSlug,
      logo_url: logoUrl,
      bunny_storage_zone_id: placeholderBunnyStorageId,
      bunny_pull_zone_hostname: placeholderBunnyHostname,
    })
    .select()
    .single();

  if (insertError) {
    throw createError({ statusCode: 500, message: insertError.message });
  }

  return newProject;
});
