// server/routes/auth/callback.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { CompatibilityEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js' // Import createClient
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event: CompatibilityEventHandler) => {
  const runtimeConfig = useRuntimeConfig(event) // Lấy runtimeConfig
  const query = getQuery(event)
  const code = query.code as string
  const redirectPath = getCookie(event, 'redirectAfterLogin') || '/dashboard'
  deleteCookie(event, 'redirectAfterLogin', { path: '/' })

  if (!code) {
    console.error('Server Route Callback: No code found in query.')
    return sendRedirect(event, '/login?error=Invalid callback (no code)', 302)
  }

  // Client mặc định để exchange code (dùng config từ module)
  const supabaseClient = await serverSupabaseClient<Database>(event)

  try {
    // 1. Trao đổi code lấy session
    const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Server Route Callback: Error exchanging code for session:', exchangeError.message)
      return sendRedirect(event, `/login?error=${encodeURIComponent('Authentication failed: ' + exchangeError.message)}`, 302)
    }

    // 2. Lấy thông tin user vừa đăng nhập
    await new Promise(resolve => setTimeout(resolve, 50));
    const user = await serverSupabaseUser(event)

    if (!user) {
      console.error('Server Route Callback: User not found after exchanging code.')
      return sendRedirect(event, '/login?error=User not found after login', 302)
    }

    // --- TẠO ADMIN CLIENT RÕ RÀNG ---
    
    // Tạo client mới với Secret Key để bỏ qua RLS
    const supabaseAdminClient = useSupabaseAdmin()


    // 3. Kiểm tra và tạo user_profile nếu chưa có (DÙNG ADMIN CLIENT)
    const { data: existingProfile, error: profileCheckError, count } = await supabaseAdminClient
      .from('user_profile')
      .select('user_id', { count: 'exact', head: true })
      .eq('user_id', user.sub)

    if (profileCheckError) {
      console.error('Server Route Callback: Error checking user profile (admin):', profileCheckError.message)
      // Xử lý lỗi nghiêm trọng hơn nếu cần
    }

    const profileExists = count === 1;

    if (!profileExists && !profileCheckError) {
      console.log(`Server Route Callback: Creating profile for new user: ${user.sub} using ADMIN client`)
      const { error: insertError } = await supabaseAdminClient // <-- Dùng admin client
        .from('user_profile')
        .insert({
          user_id: user.sub,
          email: user.email,
        })

      if (insertError) {
        // Nếu vẫn lỗi RLS ở đây -> vấn đề nằm ở DB/Policy, không phải do key
        console.error('Server Route Callback: Error creating user profile (admin):', insertError.message)
        return sendRedirect(event, `/login?error=${encodeURIComponent('Failed to create user profile: ' + insertError.message)}`, 302)
      } else {
        console.log(`Server Route Callback: Profile created successfully for user: ${user.sub}`)
      }
    } else if (profileExists) {
       console.log(`Server Route Callback: Profile already exists for user: ${user.sub}`)
    }

    // 4. Redirect về trang đích
    console.log(`Server Route Callback: Redirecting user ${user.sub} to ${redirectPath}`)
    return sendRedirect(event, redirectPath, 302)

  } catch (error: any) {
    console.error('Server Route Callback: Unexpected error:', error.message)
    return sendRedirect(event, `/login?error=${encodeURIComponent('An unexpected error occurred: ' + error.message)}`, 302)
  }
})
