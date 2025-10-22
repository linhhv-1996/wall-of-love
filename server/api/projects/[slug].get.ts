// server/api/projects/[slug].get.ts
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug;
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Project slug is required' });
  }

  // Dùng admin client vì đây là public data, không cần RLS phức tạp
  const adminSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await adminSupabase
    .from('projects')
    .select('name, logo_url')
    .eq('slug', slug)
    .single();
  
  if (error) {
    throw createError({ statusCode: 404, message: 'Project not found' });
  }
  
  return data;
});
