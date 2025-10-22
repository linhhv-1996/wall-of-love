// server/api/testimonials/submit.post.ts
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Giả lập Bunny.net API client
// Trong thực tế, bạn sẽ dùng một thư viện hoặc viết hàm fetch riêng
async function uploadToBunnyNet(storageZoneName: string, fileName: string, fileData: Buffer, apiKey: string) {
  // Đây là nơi bạn sẽ gọi API của Bunny.net để upload file
  // PUT https://storage.bunnycdn.com/{storageZoneName}/{fileName}
  console.log(`Uploading ${fileName} to Bunny.net storage zone: ${storageZoneName}`);
  
  // Logic fetch thực tế sẽ ở đây
  // const response = await fetch(`...`, { method: 'PUT', headers: { AccessKey: apiKey }, body: fileData });
  
  // Trả về URL công khai giả lập để test
  return `https://your-pull-zone-hostname.b-cdn.net/${fileName}`;
}


export default defineEventHandler(async (event) => {
  // Tạo admin client để thao tác với DB
  const adminSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const formData = await readMultipartFormData(event);
  
  const projectSlug = formData?.find(el => el.name === 'projectSlug')?.data.toString('utf-8');
  const authorName = formData?.find(el => el.name === 'authorName')?.data.toString('utf-8');
  const authorTitle = formData?.find(el => el.name === 'authorTitle')?.data.toString('utf-8');
  const content = formData?.find(el => el.name === 'content')?.data.toString('utf-8');
  const mediaFile = formData?.find(el => el.name === 'mediaFile');

  if (!projectSlug || !authorName) {
    throw createError({ statusCode: 400, message: 'Project slug and author name are required.' });
  }

  // 1. Dùng slug để tìm project và lấy thông tin Bunny.net
  const { data: project, error: projectError } = await adminSupabase
    .from('projects')
    .select('id, bunny_pull_zone_hostname') // Lấy ID và hostname của pull zone
    .eq('slug', projectSlug)
    .single();

  if (projectError || !project) {
    throw createError({ statusCode: 404, message: 'Project not found.' });
  }

  let mediaUrl = null;
  let mediaType = 'text';

  // 2. Nếu có file, upload lên Bunny.net
  if (mediaFile && mediaFile.data.length > 0) {
    const fileExt = mediaFile.filename?.split('.').pop() || 'unknown';
    const uniqueFileName = `${nanoid()}.${fileExt}`;
    
    // Tên storage zone của bạn có thể cần được lấy từ DB hoặc cấu hình
    // Giả sử tên storage zone có dạng `walloflove-<project-slug>`
    const storageZoneName = `walloflove-${projectSlug}`;

    mediaUrl = await uploadToBunnyNet(
      storageZoneName,
      uniqueFileName,
      mediaFile.data,
      process.env.BUNNY_API_KEY!
    );
    
    mediaType = mediaFile.type?.startsWith('image') ? 'image' : 'video';
    
    // Cập nhật lại mediaUrl thành URL thật từ pull zone hostname
    mediaUrl = `https://${project.bunny_pull_zone_hostname}/${uniqueFileName}`;
  }

  // 3. Lưu testimonial vào database với status 'pending'
  const { data: newTestimonial, error: insertError } = await adminSupabase
    .from('testimonials')
    .insert({
      project_id: project.id,
      author_name: authorName,
      author_title: authorTitle,
      content: content,
      media_url: mediaUrl,
      media_type: mediaType,
      status: 'pending' // Luôn ở trạng thái chờ duyệt
    })
    .select()
    .single();

  if (insertError) {
    throw createError({ statusCode: 500, message: insertError.message });
  }

  return { success: true, testimonialId: newTestimonial.id };
});
