<template>
  <div
    v-show="isOpen"
    class="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog"
    aria-modal="true"
    aria-labelledby="create-project-title"
    @click.self="closeModal"
  >
    <div class="absolute inset-0 bg-black/40"></div>

    <div class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div class="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h3 id="create-project-title" class="text-base font-bold text-ink">Create project</h3>
          <p class="mt-0.5 text-xs text-slate-600">Add a name and an optional logo.</p>
        </div>
        <button
          type="button"
          class="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 focus-ring"
          aria-label="Close"
          @click="closeModal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <div>
          <label for="projectName" class="text-xs font-medium text-slate-700">Project name *</label>
          <input
            id="projectName"
            v-model="projectName"
            name="name"
            type="text"
            required
            placeholder="e.g., Notion Templates"
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-0"
            :disabled="loading"
          />
          <p class="mt-1 text-[11px] text-slate-500">This will be shown on your dashboard and wall.</p>
        </div>

        <div>
          <label class="text-xs font-medium text-slate-700">Logo</label>
          <div class="mt-1 rounded-lg border border-slate-200 p-3">
            <div class="flex items-center gap-3">
                <img
                id="logoPreview"
                :src="logoPreviewUrl || 'https://dummyimage.com/80x80/edf2f7/94a3b8&text=+'"
                alt="Logo preview"
                class="h-12 w-12 rounded-lg border border-slate-200 object-cover bg-slate-50" />
                <div class="flex-1">
                <label for="projectLogo" class="sr-only">Upload logo</label>
                <input
                    id="projectLogo"
                    ref="logoInputRef"
                    name="logo"
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    class="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-slate-50 focus:outline-none"
                    @change="handleLogoChange"
                    :disabled="loading"
                />
                <p class="mt-1 text-[11px] text-slate-500">PNG, JPG, or SVG. Max 2MB. Recommended square.</p>
                </div>
            </div>
          </div>
           </div>

        <p v-if="displayError" class="text-xs text-red-600">{{ displayError }}</p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-ring"
            @click="closeModal"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white shadow hover:opacity-95 focus-ring disabled:opacity-70"
            :disabled="loading || !projectName || !!errorMessageInternal"
          >
             <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 7 10 17l-5-5"/>
            </svg>
            {{ loading ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phần script giữ nguyên như trước
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean;
  loading: boolean;
  errorMessage: string | null;
}>()

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', formData: FormData): void;
}>()

const projectName = ref('')
const selectedLogoFile = ref<File | null>(null)
const logoPreviewUrl = ref<string | null>(null)
const logoInputRef = ref<HTMLInputElement | null>(null)
const errorMessageInternal = ref<string | null>(null);

const closeModal = () => {
  if (!props.loading) {
    resetForm();
    emit('close');
  }
}

const resetForm = () => {
    projectName.value = '';
    selectedLogoFile.value = null;
    logoPreviewUrl.value = null;
    errorMessageInternal.value = null;
    if (logoInputRef.value) {
        logoInputRef.value.value = '';
    }
}

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      errorMessageInternal.value = 'Invalid file type (PNG, JPG, SVG only).';
      resetLogo();
      return;
    }
    if (file.size > maxSize) {
      errorMessageInternal.value = 'File size exceeds 2MB limit.';
      resetLogo();
      return;
    }

    selectedLogoFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { logoPreviewUrl.value = e.target?.result as string; };
    reader.readAsDataURL(file);
    errorMessageInternal.value = null;
  } else {
    resetLogo();
  }
}

const resetLogo = () => {
    selectedLogoFile.value = null;
    logoPreviewUrl.value = null;
     if (logoInputRef.value) {
        logoInputRef.value.value = '';
    }
}

const handleSubmit = () => {
  if (!projectName.value.trim() || props.loading || errorMessageInternal.value) {
    return;
  }
  const formData = new FormData();
  formData.append('name', projectName.value.trim());
  if (selectedLogoFile.value) {
    formData.append('logo', selectedLogoFile.value);
  }
  emit('submit', formData);
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
     resetForm();
  }
});

const displayError = computed(() => errorMessageInternal.value || props.errorMessage);
</script>
