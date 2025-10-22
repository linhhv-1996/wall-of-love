// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Nếu người dùng chưa đăng nhập và đang cố gắng truy cập một trang không phải là trang login
  // thì chuyển hướng họ về trang login.
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
