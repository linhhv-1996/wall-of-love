<template>
  <div class="min-h-screen text-slate-800 flex flex-col">
    <main class="flex-1">
      <div class="mx-auto max-w-[60rem] px-4">
        <div class="flex min-h-screen items-center justify-center py-10">
          <div class="w-full max-w-md">

            <div class="mb-6 text-center">
              <a href="#" class="inline-flex items-center gap-2">
                <span class="grid h-9 w-9 place-content-center rounded-xl bg-ink text-white text-sm font-bold">W</span>
                <span class="text-sm font-semibold tracking-tight">Wall of Love</span>
              </a>
              <h1 class="mt-4 text-xl font-bold text-ink">Sign in to your account</h1>
              <p class="mt-1 text-sm text-slate-600">Choose Google or get a magic link via email.</p>
            </div>

            <section class="rounded-xl border border-slate-200 p-5 shadow-sm bg-white">
              <button
                @click="signInWithGoogle"
                :disabled="loading"
                id="btn-google"
                class="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-4 w-4" aria-hidden="true"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.05,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.05,6.053,28.761,4,24,4C16.318,4,9.689,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.717,0,9.005-1.805,12.27-4.757l-5.657-5.657C28.566,35.091,26.392,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.539,5.036C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.147-4.102,5.527l0.003-0.002l6.557,6.557 C36.621,40.621,44,36,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                <span>Continue with Google</span>
              </button>

              <div class="my-4 flex items-center gap-3 text-[11px] text-slate-500">
                <div class="h-px flex-1 bg-slate-200"></div><span>OR</span><div class="h-px flex-1 bg-slate-200"></div>
              </div>

              <form @submit.prevent="signInWithMagicLink" class="space-y-2" novalidate>
                <label for="email" class="block text-xs font-medium text-slate-700">Email</label>
                <div class="relative">
                  <input
                    v-model="email"
                    id="email"
                    name="email"
                    type="email"
                    inputmode="email"
                    placeholder="you@example.com"
                    required
                    class="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-sm placeholder:text-slate-400 focus:ring-0 focus:outline-none focus:border-slate-400"
                  >
                  <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 8l9 6 9-6"/></svg>
                </div>
                <p class="text-[11px] text-slate-500">We'll email you a secure link to sign in.</p>

                <button
                  type="submit"
                  :disabled="loading"
                  class="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16.5 12a4.5 4.5 0 10-9 0v3h9v-3Z M3 9l9 6 9-6"/></svg>
                  <span>{{ loading ? 'Sending...' : 'Send magic link' }}</span>
                </button>
              </form>

              <p class="mt-3 text-[11px] text-slate-500">By continuing, you agree to our <a href="#" class="underline underline-offset-2">Terms</a> and <a href="#" class="underline underline-offset-2">Privacy Policy</a>.</p>
            </section>

            <p class="mt-6 text-center text-xs text-slate-500">© 2025 Wall of Love</p>
          </div>
        </div>
      </div>
    </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const { showToast } = useToast()
const loading = ref(false)
const email = ref('')
const router = useRouter() // <- Thêm dòng này

// Lấy redirect URL từ config hoặc đặt cứng
// Đảm bảo URL này khớp với cấu hình trong nuxt.config.ts và Supabase Dashboard
const redirectUrl = useRuntimeConfig().public.baseUrl
  ? `${useRuntimeConfig().public.baseUrl}/auth/callback`
  : 'http://localhost:3000/auth/callback';


// --- Login với Google ---
const signInWithGoogle = async () => {
  loading.value = true
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl // Sử dụng redirectUrl đã cập nhật
    }
  })
  if (error) {
    showToast(`Error: ${error.message}`)
    loading.value = false
  }
  // Supabase xử lý redirect qua server route, không cần làm gì thêm ở client
}

// --- Login với Magic Link ---
const signInWithMagicLink = async () => {
  if (!email.value) {
    showToast('Please enter your email address.')
    return
  }
  loading.value = true
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: redirectUrl // Sử dụng redirectUrl đã cập nhật
    }
  })
  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast('Check your email for the magic link!')
    email.value = '' // Xóa email sau khi gửi thành công
  }
  loading.value = false
}

// Kiểm tra nếu đã login thì redirect về dashboard (phòng trường hợp vào lại trang login)
const user = useSupabaseUser()
if (user.value) {
  router.replace('/dashboard') // Dùng replace để không lưu trang login vào history
}

</script>
