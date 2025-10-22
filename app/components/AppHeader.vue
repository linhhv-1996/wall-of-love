<template>
  <header class="bg-white shadow-sm">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="text-2xl font-bold text-gray-800">
            Wall of Love
          </NuxtLink>
        </div>

        <div class="hidden md:flex md:space-x-8">
          <NuxtLink to="/pricing" class="text-gray-500 hover:text-gray-700">Pricing</NuxtLink>
          <NuxtLink to="/features" class="text-gray-500 hover:text-gray-700">Features</NuxtLink>
          <NuxtLink to="/contact" class="text-gray-500 hover:text-gray-700">Contact</NuxtLink>
        </div>

        <div class="flex items-center space-x-4">
          <template v-if="user">
            <NuxtLink to="/dashboard" class="text-sm font-medium text-gray-600 hover:text-gray-900">
              Dashboard
            </NuxtLink>
            <button @click="handleLogout" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign in
            </NuxtLink>
            <NuxtLink to="/signup" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Sign up
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};
</script>

<style scoped>
/* Optional: Add active link styling */
.router-link-exact-active {
  color: #4f46e5; /* indigo-600 */
}
</style>
