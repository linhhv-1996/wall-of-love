// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],
  runtimeConfig: {
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      supabaseKey: process.env.SUPABASE_KEY
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,

    redirectOptions: {
      login: '/login', // Trang sẽ redirect về nếu chưa login
      callback: '/api/auth/callback',
      exclude: ['/login', '/', '/api/auth/callback'],
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8, // Thời gian sống của cookie session (vd: 8 tiếng)
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // Chỉ dùng secure cookie trên HTTPS
    },
    clientOptions: {
      auth: {
        flowType: 'pkce', // Nên dùng PKCE cho bảo mật tốt hơn
        // autoRefreshToken: true, // Mặc định là true
        // persistSession: true, // Mặc định là true
        // detectSessionInUrl: true // Mặc định là true, cần thiết cho callback OAuth/Magic Link
      },
    },
  },
  css: ['~/assets/css/main.css'],
})
