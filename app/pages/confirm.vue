<template>
  <div class="min-h-screen flex items-center justify-center">
    <p>Waiting for login...</p>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const router = useRouter();

// Ngay khi user được xác thực (thông tin user có sẵn),
// chuyển hướng họ đến dashboard.
watch(
  user,
  () => {
    if (user.value) {
      router.push('/dashboard');
    }
  },
  { immediate: true }
);
</script>
