<template>
  <div class="min-h-screen text-slate-800 flex flex-col">
    <header
      class="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div class="mx-auto max-w-[60rem] px-4">
        <div class="flex items-center justify-between py-3">
          <NuxtLink to="/dashboard" class="flex items-center gap-2">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white font-bold shadow">W</span>
            <span class="text-sm font-semibold tracking-tight">Wall of Love</span>
          </NuxtLink>
          <div v-if="user" class="hidden sm:flex items-center gap-3">
             <div class="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 shadow-sm bg-white/80">
              <img :src="user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email?.charAt(0)}&background=0f172a&color=fff&rounded=true&size=32`" alt="avatar" class="h-6 w-6 rounded-full ring-2 ring-white" />
              <span class="text-xs text-slate-600">{{ user.email }}</span>
            </div>
            <button @click="handleLogout" class="focus-ring rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
              Logout
            </button>
          </div>
          <button class="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 focus-ring bg-white/80" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot /> </main>

    <Teleport to="body"> <slot name="modal"></slot> </Teleport>

    <footer class="mt-auto border-t border-slate-200">
      <div class="mx-auto max-w-[60rem] px-4 py-6">
        <p class="text-xs text-slate-500">© 2025 Wall of Love. All rights reserved.
          <a href="#" class="ml-3 underline underline-offset-2 hover:text-slate-700">Terms</a>
          <span class="mx-1">·</span>
          <a href="#" class="underline underline-offset-2 hover:text-slate-700">Privacy</a>
        </p>
      </div>
    </footer>

  </div> </template>

<script setup lang="ts">
// Script setup của layout không cần thay đổi nhiều
// Không cần import CreateProjectModal ở đây nữa
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const { showToast } = useToast()

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    showToast(`Logout failed: ${error.message}`)
  } else {
    await router.push('/login')
  }
}
</script>
