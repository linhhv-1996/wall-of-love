<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <AppHeader />

    <main class="flex-grow">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Nuxt 3 automatically imports components from the `components` directory.
// So you don't need to write `import AppHeader from '~/components/AppHeader.vue'`
</script>
