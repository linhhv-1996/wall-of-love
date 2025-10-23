<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <GlobalToast />
  </div>
</template>

<script setup lang="ts">
// Thêm font và style global từ HTML của bạn
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', rel: 'stylesheet' }
  ],
  style: [
    {
      innerHTML: `
        :root { --ring: 0 0 0 3px rgba(99, 102, 241, .35) }
        html, body { font-family: 'Inter', ui-sans-serif, system-ui; }
        .focus-ring:focus { outline: none; box-shadow: var(--ring); }
      `
    }
  ]
})
</script>
