// server/api/dashboard.get.ts
import { serverSupabaseUser } from '#supabase/server' // Chỉ cần user để lấy ID

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event) // Lấy runtimeConfig

  // 1. Xác thực người dùng (vẫn dùng helper của module)
  const user = await serverSupabaseUser(event)
  if (!user) {
    console.error('API /api/dashboard: Unauthorized - serverSupabaseUser returned null.');
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. User session not found.',
    })
  }
  const userId = user.sub
  console.log(`API /api/dashboard: User ${userId} authenticated. Creating admin client...`);

  // --- TẠO ADMIN CLIENT RÕ RÀNG ---
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseSecretKey = runtimeConfig.supabaseSecretKey

  if (!supabaseUrl || !supabaseSecretKey) {
      console.error('API /api/dashboard: SUPABASE_URL or SUPABASE_SECRET_KEY is missing!')
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error.' })
  }

  // Tạo client mới với Secret Key
  const supabaseAdminClient = useSupabaseAdmin()

  try {
    console.log(`API /api/dashboard: Fetching data for user ${userId} using ADMIN client...`);

    // 2. Fetch user profile (DÙNG ADMIN CLIENT và maybeSingle)
    const { data: profileData, error: profileError } = await supabaseAdminClient // <-- Dùng admin client
      .from('user_profile')
      .select('user_id, email, full_name, plan_type, total_allocated_bytes, current_usage_bytes')
      .eq('user_id', userId)
      .maybeSingle() // <-- Vẫn dùng maybeSingle cho an toàn

    // Xử lý lỗi fetch profile
    if (profileError) {
      console.error(`API Dashboard: Error fetching profile (admin) for user ${userId}:`, profileError.message)
      // Lỗi này giờ không nên là RLS nữa
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch user profile: ${profileError.message}`,
      })
    }

    // Xử lý không tìm thấy profile
    if (!profileData) {
        console.warn(`API Dashboard: Profile not found (admin) for user ${userId}.`)
        throw createError({
            statusCode: 404,
            statusMessage: 'User profile not found.',
        })
    }

    // 3. Fetch projects (DÙNG ADMIN CLIENT)
    const { data: projectsData, error: projectsError } = await supabaseAdminClient // <-- Dùng admin client
      .from('projects')
      .select('project_id, name, slug, logo_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Xử lý lỗi fetch projects
    if (projectsError) {
      console.error(`API Dashboard: Error fetching projects (admin) for user ${userId}:`, projectsError.message)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch projects: ${projectsError.message}`,
      })
    }

    // TODO: Fetch stats dùng admin client

    console.log(`API /api/dashboard: Data fetched successfully for user ${userId}`);
    return {
      profile: profileData,
      projects: projectsData || [],
      // stats: { ... }
    }

  } catch (error: any) {
    // Ném lại lỗi (đã được tạo bởi createError ở trên) hoặc tạo lỗi 500 mặc định
    if (!error.statusCode) {
        console.error(`API Dashboard: Unexpected error during admin fetch for user ${userId}:`, error.message)
         throw createError({
            statusCode: 500,
            statusMessage: 'An unexpected error occurred while fetching dashboard data.'
        })
    }
    throw error;
  }
})
