<template>
  <div>
    <div v-if="!testimonials || testimonials.length === 0" class="text-center py-12">
      <p class="text-gray-500">No testimonials in this category.</p>
    </div>
    <div v-else class="space-y-6">
      <div v-for="item in testimonials" :key="item.id" class="bg-gray-50 p-4 rounded-lg border">
        <div class="flex">
          <div class="w-1/3 pr-4" v-if="item.media_url">
            <img v-if="item.media_type === 'image'" :src="item.media_url" class="rounded-md object-cover w-full h-auto">
            <video v-if="item.media_type === 'video'" :src="item.media_url" controls class="rounded-md w-full h-auto"></video>
          </div>
          <div class="flex-1">
            <blockquote class="italic text-gray-700">"{{ item.content }}"</blockquote>
            <p class="mt-2 font-semibold text-gray-900">{{ item.author_name }}</p>
            <p class="text-sm text-gray-500">{{ item.author_title }}</p>
            <p class="text-xs text-gray-400 mt-1">Submitted: {{ new Date(item.created_at).toLocaleString() }}</p>
          </div>
        </div>

        <div class="mt-4 flex space-x-2 justify-end pt-4 border-t sm:border-none sm:pt-0 sm:mt-0 sm:flex-col sm:justify-start sm:items-end">
          
          <template v-if="item.status === 'pending'">
            <button @click="$emit('update', { id: item.id, status: 'rejected' })" class="px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">Reject</button>
            <button @click="$emit('update', { id: item.id, status: 'approved' })" class="px-3 py-1 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Approve</button>
          </template>

          <template v-else-if="item.status === 'approved'">
            <button @click="$emit('update', { id: item.id, status: 'hidden' })" class="px-3 py-1 text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200">Hide</button>
            <button @click="$emit('update', { id: item.id, status: 'rejected' })" class="px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">Reject</button>
          </template>
          
          <template v-else-if="item.status === 'hidden'">
            <button @click="$emit('update', { id: item.id, status: 'approved' })" class="px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">Un-hide (Approve)</button>
          </template>

          <template v-else-if="item.status === 'rejected'">
            <button @click="$emit('update', { id: item.id, status: 'approved' })" class="px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">Approve</button>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  testimonials: {
    type: Array as () => any[],
    required: true
  }
});
// Chuẩn hóa event thành một event duy nhất là 'update'
defineEmits(['update']);
</script>
