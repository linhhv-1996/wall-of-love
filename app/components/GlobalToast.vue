<template>
  <div
    v-if="message"  role="status"
    aria-live="polite"
    class="pointer-events-none fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white shadow"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
// Sửa: Dùng 'useToastState' để đọc message
const message = useToastState() 
</script>
