<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div v-if="pending" class="text-center">Loading...</div>
    <div v-else-if="error || !project" class="text-center text-red-500">
      Project not found or could not be loaded.
    </div>
    <div v-else class="sm:mx-auto sm:w-full sm:max-w-xl">
      <div v-if="isSuccess" class="bg-white py-12 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <h2 class="text-2xl font-bold text-green-600">Thank You!</h2>
        <p class="mt-4 text-gray-600">Your testimonial has been submitted successfully and is now pending review.</p>
        <button @click="resetForm" class="mt-8 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Submit Another One
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
        <div class="text-center">
          <img :src="project.logo_url" alt="Project Logo" class="mx-auto h-16 w-16 rounded-full object-cover">
          <h2 class="mt-4 text-2xl font-bold text-gray-800">Submit a testimonial for</h2>
          <p class="text-xl text-indigo-600">{{ project.name }}</p>
        </div>
        
        <div>
          <label for="authorName" class="block text-sm font-medium text-gray-700">Your Name *</label>
          <input v-model="authorName" type="text" id="authorName" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="authorTitle" class="block text-sm font-medium text-gray-700">Your Title (e.g., CEO at Company)</label>
          <input v-model="authorTitle" type="text" id="authorTitle" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Testimonial Content</label>
          <textarea v-model="content" id="content" rows="4" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label for="mediaFile" class="block text-sm font-medium text-gray-700">Upload Image or Video</label>
          <input type="file" @change="handleFileChange" id="mediaFile" accept="image/*,video/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
        </div>
        
        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
        
        <div>
          <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            {{ loading ? 'Submitting...' : 'Submit Testimonial' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Trang này công khai, không cần auth middleware
definePageMeta({
  layout: 'default' // Sử dụng layout có header/footer
})

const route = useRoute();
const slug = route.params.slug as string;

// State cho form
const authorName = ref('');
const authorTitle = ref('');
const content = ref('');
const mediaFile = ref<File | null>(null);
const loading = ref(false);
const submitError = ref<string | null>(null);
const isSuccess = ref(false);

// Lấy thông tin public của project để hiển thị
const { data: project, pending, error } = await useFetch(`/api/projects/${slug}`);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    mediaFile.value = target.files[0];
  }
}

const handleSubmit = async () => {
  loading.value = true;
  submitError.value = null;

  const formData = new FormData();
  formData.append('projectSlug', slug);
  formData.append('authorName', authorName.value);
  formData.append('authorTitle', authorTitle.value);
  formData.append('content', content.value);
  if (mediaFile.value) {
    formData.append('mediaFile', mediaFile.value);
  }

  try {
    await $fetch('/api/testimonials/submit', {
      method: 'POST',
      body: formData,
    });
    isSuccess.value = true;
  } catch (err: any) {
    submitError.value = err.data?.message || 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
}

const resetForm = () => {
  isSuccess.value = false;
  authorName.value = '';
  authorTitle.value = '';
  content.value = '';
  mediaFile.value = null;
  // Xóa file đã chọn khỏi input
  const fileInput = document.getElementById('mediaFile') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}
</script>
