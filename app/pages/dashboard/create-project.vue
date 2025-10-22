<template>
  <div class="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Create a New Project</h1>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <div>
            <label for="projectName" class="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              v-model="projectName"
              type="text"
              id="projectName"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="logo" class="block text-sm font-medium text-gray-700">
              Project Logo
            </label>
            <input
              type="file"
              id="logo"
              @change="handleFileChange"
              required
              accept="image/png, image/jpeg, image/gif"
              class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {{ loading ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const projectName = ref('');
const logoFile = ref<File | null>(null);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const router = useRouter();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    logoFile.value = target.files[0];
  }
};

const handleSubmit = async () => {
  if (!projectName.value || !logoFile.value) {
    errorMessage.value = "Please fill in all fields.";
    return;
  }

  loading.value = true;
  errorMessage.value = null;

  const formData = new FormData();
  formData.append('projectName', projectName.value);
  formData.append('logo', logoFile.value);

  try {
    const newProject = await $fetch('/api/projects/create', {
      method: 'POST',
      body: formData,
    });
    // Redirect to the new project's page
    router.push(`/dashboard/project/${newProject.slug}`);
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'An unknown error occurred.';
  } finally {
    loading.value = false;
  }
};
</script>
