<template>
  <div class="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div v-if="projectPending">... Loading ...</div>
    <div v-else-if="projectError || !project">... Error ...</div>
    <div v-else>
      <div class="flex items-center mb-8">
        <img v-if="project.logo_url" :src="project.logo_url" alt="Project Logo" class="h-16 w-16 rounded-full object-cover mr-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ project.name }}</h1>
          <p class="text-gray-500">Managing testimonials for: {{ project.slug }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md">
        <nav class="flex border-b flex-wrap">
          <button @click="activeTab = 'pending'" :class="tabClass('pending')">Pending ({{ pendingTestimonials.length }})</button>
          <button @click="activeTab = 'approved'" :class="tabClass('approved')">Approved ({{ approvedTestimonials.length }})</button>
          <button @click="activeTab = 'hidden'" :class="tabClass('hidden')">Hidden ({{ hiddenTestimonials.length }})</button>
          <button @click="activeTab = 'rejected'" :class="tabClass('rejected')">Rejected ({{ rejectedTestimonials.length }})</button>
        </nav>

        <div class="p-6">
          <div v-if="testimonialsPending" class="text-center">Loading testimonials...</div>
          <div v-else>
            <TestimonialList 
              v-if="activeTab === 'pending'" 
              :testimonials="pendingTestimonials" 
              @update="updateStatus" 
            />
            <TestimonialList 
              v-if="activeTab === 'approved'" 
              :testimonials="approvedTestimonials" 
              @update="updateStatus" 
            />
            <TestimonialList 
              v-if="activeTab === 'hidden'" 
              :testimonials="hiddenTestimonials" 
              @update="updateStatus" 
            />
            <TestimonialList 
              v-if="activeTab === 'rejected'" 
              :testimonials="rejectedTestimonials" 
              @update="updateStatus" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';

definePageMeta({ middleware: 'auth' })

const route = useRoute();
const client = useSupabaseClient();
const slug = route.params.slug as string;
const activeTab = ref('pending');

// 2. Manual refs and watchEffect for testimonials (no change)
const testimonials = ref<any[] | null>(null);
const testimonialsPending = ref(true);
const testimonialsError = ref<Error | null>(null);



// 1. Fetch project data như cũ. Phần này đã hoạt động tốt.
const { data: project, pending: projectPending, error: projectError } = useAsyncData(
  `project-${slug}`,
  async () => {
    const { data, error } = await client
      .from('projects')
      .select('id, name, slug, logo_url')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }
);


// 3. Dùng watchEffect để fetch testimonials một cách an toàn
watchEffect(async () => {
  // Guard clause: watchEffect sẽ tự chạy lại khi project.value thay đổi.
  // Chúng ta chỉ hành động khi project.value có giá trị.
  if (project.value?.id) {
    testimonialsPending.value = true;
    testimonialsError.value = null;
    try {
      const { data, error } = await client
        .from('testimonials')
        .select('*')
        .eq('project_id', project.value.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      testimonials.value = data;
    } catch (err: any) {
      testimonialsError.value = err;
    } finally {
      testimonialsPending.value = false;
    }
  }
});

// 3. Computed properties (UPDATED)
const pendingTestimonials = computed(() => testimonials.value?.filter(t => t.status === 'pending') || []);
const approvedTestimonials = computed(() => testimonials.value?.filter(t => t.status === 'approved') || []);
const hiddenTestimonials = computed(() => testimonials.value?.filter(t => t.status === 'hidden') || []); // <-- ADDED
const rejectedTestimonials = computed(() => testimonials.value?.filter(t => t.status === 'rejected') || []);

// 4. Function to update testimonial status (UPDATED)
// Đổi tên thành 'updateStatus' và nhận event chung
const updateStatus = async (payload: { id: string, status: string }) => {
  try {
    const { error } = await client
      .from('testimonials')
      .update({ status: payload.status })
      .eq('id', payload.id);

    if (error) throw error;

    if (testimonials.value) {
      const item = testimonials.value.find(t => t.id === payload.id);
      if (item) item.status = payload.status;
    }
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    alert('Failed to update status.');
  }
};

// Helper for tab styling
const tabClass = (tabName: string) => {
  return activeTab.value === tabName
    ? 'border-b-2 border-indigo-500 text-indigo-600 px-4 py-3 font-medium text-sm sm:text-base'
    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-4 py-3 font-medium text-sm sm:text-base';
};
</script>


