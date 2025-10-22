<template>
  <div class="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">My Projects</h1>
      <NuxtLink
        to="/dashboard/create-project"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Create New Project
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-center text-gray-500">
      <p>Loading projects...</p>
    </div>

    <div v-else-if="error" class="text-center text-red-500 bg-red-100 p-4 rounded-md">
      <p>Error loading projects: {{ error.message }}</p>
    </div>

    <div v-else-if="!projects || projects.length === 0" class="text-center border-2 border-dashed border-gray-300 p-12 rounded-lg">
      <h3 class="text-xl font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
      <div class="mt-6">
        <NuxtLink
          to="/dashboard/create-project"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Project
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
      >
        <div class="p-6 flex-grow">
          <div class="flex items-start">
            <img v-if="project.logo_url" :src="project.logo_url" alt="Project Logo" class="h-12 w-12 rounded-full object-cover mr-4">
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-800 truncate">{{ project.name }}</h2>
              <p class="text-sm text-gray-500 mt-1 truncate">{{ project.slug }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-50 border-t grid grid-cols-2 gap-2">
          <button
            @click="copySubmitLink(project.slug)"
            class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm"
            :class="{
              'bg-green-500 text-white hover:bg-green-600': copiedSlug === project.slug,
              'bg-white text-gray-700 hover:bg-gray-50': copiedSlug !== project.slug
            }"
          >
            {{ copiedSlug === project.slug ? 'Copied!' : 'Copy Link' }}
          </button>
          <NuxtLink
            :to="`/dashboard/project/${project.slug}`"
            class="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Manage
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// State để theo dõi slug vừa được copy
const copiedSlug = ref<string | null>(null);

const { data: projects, pending, error } = await useAsyncData(
  'projects',
  async () => {
    if (!user.value) return []
    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('user_id', user.value.sub)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
  {
    watch: [user]
  }
)

// Hàm để copy link submit
const copySubmitLink = (slug: string) => {
  // `window.location.origin` sẽ tự động lấy đúng domain (localhost hoặc domain thật)
  const url = `${window.location.origin}/submit/${slug}`;
  
  // Dùng API của trình duyệt để copy vào clipboard
  navigator.clipboard.writeText(url).then(() => {
    // Cập nhật state để hiển thị feedback "Copied!"
    copiedSlug.value = slug;
    
    // Reset lại trạng thái sau 2 giây
    setTimeout(() => {
      copiedSlug.value = null;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy link.');
  });
};
</script>
