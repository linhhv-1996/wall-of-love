// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()

  // Chỉ kiểm tra nếu đang ở client-side
  if (process.client) {
    // Chờ một chút để Supabase client kịp khởi tạo và lấy user từ session/local storage
    // Bạn có thể cần điều chỉnh thời gian chờ hoặc dùng cách khác tinh tế hơn
    await new Promise(resolve => setTimeout(resolve, 50));

    if (!user.value) {
      // Lưu lại đường dẫn muốn truy cập vào cookie
      const cookie = useCookie('redirectAfterLogin', { path: '/' })
      cookie.value = to.fullPath

      // Chuyển hướng đến trang login
      console.log('Redirecting to login from:', to.fullPath) // Log để debug
      return navigateTo('/login')
    }
    // Nếu đã login, cho phép truy cập
    console.log('User authenticated, proceeding to:', to.fullPath) // Log để debug
  }
  // Nếu ở server-side, giả định user có thể được xác thực qua cookie (Supabase module sẽ xử lý)
  // hoặc nếu không có user.value thì để client-side middleware xử lý redirect.
})
