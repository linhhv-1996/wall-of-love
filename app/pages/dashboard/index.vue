<template>
  <div class="mx-auto max-w-[60rem] px-4 py-6 md:py-8 space-y-6 md:space-y-8">

    <div v-if="pending" class="text-center py-10">
      <p>Loading dashboard data...</p>
      </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 p-4 shadow-sm bg-red-50 text-red-700">
       <h2 class="font-semibold">Error loading dashboard data</h2>
      <p class="text-sm mt-1">{{ error?.data?.message || error?.message || 'Could not fetch data.' }}</p>
      <button @click="refresh" class="mt-2 text-sm underline">Try again</button>
    </div>

    <template v-else-if="dashboardData">
      <section aria-labelledby="plan-title">
        <div class="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="plan-title" class="text-xs font-semibold text-ink">Your Plan</h2>
              <p class="text-xs text-slate-600">{{ getPlanDisplayName(dashboardData.profile?.plan_type) }}</p>
            </div>
            <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <button class="focus-ring rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50">
                Manage billing
              </button>
              <button class="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 5v14m7-7H5" /></svg>
                Top up +100GB ($10)
              </button>
            </div>
          </div>
          <div class="mt-3" v-if="dashboardData.profile && dashboardData.profile.total_allocated_bytes > 0">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span class="font-bold uppercase tracking-wide">Bandwidth</span>
              <span>
                {{ formatBytes(dashboardData.profile.current_usage_bytes) }} used of
                {{ formatBytes(dashboardData.profile.total_allocated_bytes) }}
              </span>
            </div>
            <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-width duration-300 ease-in-out"
                :style="{ width: `${bandwidthPercentage}%` }">
              </div>
            </div>
          </div>
           <div v-else class="mt-3 text-xs text-slate-500">
            {{ dashboardData.profile ? 'Bandwidth tracking not applicable.' : 'Loading profile...' }}
          </div>
        </div>
      </section>

      <section aria-label="Account overview stats">
         <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <div class="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
            <div class="text-xs font-semibold text-ink">Total Active</div>
            <div class="mt-1 text-3xl font-bold tracking-tight text-brand-600">{{ dashboardData.stats?.activeTestimonials ?? '-' }}</div>
            <div class="mt-0.5 text-xs text-slate-500">Testimonials shown</div>
          </div>
          <div class="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
            <div class="text-xs font-semibold text-ink">Total Collected</div>
            <div class="mt-1 text-3xl font-bold tracking-tight text-ink">{{ dashboardData.stats?.totalTestimonials ?? '-' }}</div>
            <div class="mt-0.5 text-xs text-slate-500">Across all projects</div>
          </div>
          <div class="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
            <div class="text-xs font-semibold text-ink">New This Week</div>
            <div class="mt-1 text-3xl font-bold tracking-tight text-ink">{{ dashboardData.stats?.newThisWeek ?? '-' }}</div>
            <div class="mt-0.5 text-xs text-slate-500">Past 7 days</div>
          </div>
           <div class="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
            <div class="text-xs font-semibold text-ink">Total Projects</div>
            <div class="mt-1 text-3xl font-bold tracking-tight text-ink">{{ dashboardData.projects?.length ?? 0 }}</div>
            <div class="mt-0.5 text-xs text-slate-500">Active walls</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="projects-title" class="space-y-4">
         <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="projects-title" class="text-lg font-bold text-ink">Projects</h2>
            <p class="mt-1 text-sm text-slate-600">Manage all your walls, copy embed code, and share submission links.</p>
          </div>
          <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div class="flex-1 sm:flex-none">
              <label class="sr-only" for="search">Search projects</label>
              <div class="relative">
                <input id="search" type="text" placeholder="Search projects…" class="w-full sm:w-64 rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:ring-0 focus:outline-none focus:border-slate-400">
                <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm7-1-3.5-3.5" /></svg>
              </div>
            </div>
            <button
              @click="openCreateModal"
              class="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white shadow hover:opacity-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m7-7H5" /></svg>
              <span>New project</span>
            </button>
          </div>
        </div>

        <div v-if="dashboardData.projects && dashboardData.projects.length > 0" class="rounded-lg border border-slate-200 overflow-hidden">
           <div class="hidden md:grid grid-cols-12 items-center px-5 py-2.5 border-b border-slate-200 bg-white">
            <div class="col-span-6 text-[11px] font-bold uppercase tracking-wide text-slate-500">Project</div>
            <div class="col-span-6 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">Stats &amp; Actions</div>
          </div>
          <ul class="divide-y divide-slate-200">
            <li v-for="project in dashboardData.projects" :key="project.project_id" class="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-slate-500/5 transition">
              <div class="col-span-12 md:col-span-6 min-w-0 flex items-center gap-3">
                 <img
                  :alt="`${project.name} logo`"
                  class="h-9 w-9 rounded-lg border border-slate-200 object-cover bg-slate-100"
                  :src="project.logo_url || `https://ui-avatars.com/api/?name=${project.name?.charAt(0)}&background=6366f1&color=fff&rounded=true&size=40`" />
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-ink">{{ project.name }}</div>
                  <div class="truncate text-xs text-slate-500">slug: <span class="font-mono">{{ project.slug }}</span></div>
                </div>
              </div>
              <div class="col-span-12 md:col-span-6">
                 <div class="flex flex-wrap justify-start md:justify-end items-center gap-x-3 gap-y-1.5">
                  <div class="text-xs text-slate-600">
                    <span class="font-bold text-ink">{{ project.stats?.active ?? '-' }}</span>
                    <span class="font-medium">Active</span> /
                    <span class="font-bold text-ink">{{ project.stats?.total ?? '-' }}</span>
                    <span class="font-medium">Total</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button :data-slug="project.slug" class="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"><span class="font-mono text-[11px]">&lt;/&gt;</span><span>Embed</span></button>
                    <button :data-slug="project.slug" class="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"><span class="text-base leading-none">→</span><span>Submit</span></button>
                    <button :data-slug="project.slug" class="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 text-red-600 hover:bg-red-50 hover:border-red-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h6" /><path d="M10 6V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v1" /><path d="M4 6h16" /><path d="M6 6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6" /><path d="M10 10v7M14 10v7" /></svg>
                      <span>Delete</span></button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else id="empty-state">
           <div class="rounded-lg border border-slate-200 p-10 text-center">
            <div class="mx-auto mb-3 grid h-12 w-12 place-content-center rounded-full border border-slate-200">❤</div>
            <h3 class="text-sm font-bold text-ink">Create your first project</h3>
            <p class="mx-auto mt-1 max-w-sm text-sm text-slate-600">Start collecting testimonials in minutes. Create a project to get your embed and submission link.</p>
            <button
                @click="openCreateModal"
                class="mt-4 focus-ring inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white shadow hover:opacity-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m7-7H5" /></svg>
              <span>New project</span>
            </button>
          </div>
        </div>
      </section>
    </template>

    
      <CreateProjectModal
          :is-open="showCreateModal"
          :loading="isCreatingProject"
          :error-message="createProjectError"
          @close="closeCreateModal"
          @submit="handleCreateProject"
      />
    
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'
import CreateProjectModal from '~/components/CreateProjectModal.vue'

// Định nghĩa kiểu dữ liệu
type Profile = Database['public']['Tables']['user_profile']['Row']
type ProjectStats = { active?: number; total?: number; }
type Project = Database['public']['Tables']['projects']['Row'] & { stats?: ProjectStats }
interface DashboardStats { activeTestimonials?: number; totalTestimonials?: number; newThisWeek?: number; }
interface DashboardData { profile: Profile | null; projects: Project[]; stats?: DashboardStats; }

// Fetch dữ liệu từ API endpoint (chạy ở client)
const { data: dashboardData, pending, error, refresh } = useFetch<DashboardData>('/api/dashboard', {
    lazy: true,
    server: false,
    default: () => ({ profile: null, projects: [], stats: {} }),
});

// State cho Modal Tạo Project
const showCreateModal = ref(false)
const isCreatingProject = ref(false)
const createProjectError = ref<string | null>(null)
const { showToast } = useToast()

// Hàm Mở/Đóng Modal
const openCreateModal = () => {
  createProjectError.value = null
  showCreateModal.value = true
}
const closeCreateModal = () => {
  showCreateModal.value = false
}

// Hàm Xử lý Submit Tạo Project
const handleCreateProject = async (formData: FormData) => {
  isCreatingProject.value = true
  createProjectError.value = null

  try {
    const newProject = await $fetch('/api/projects', {
      method: 'POST',
      body: formData,
    })

    showToast('Project created successfully!')
    closeCreateModal()
    await refresh() // Refresh data dashboard

  } catch (err: any) {
    console.error('Error creating project:', err)
    createProjectError.value = err.data?.message || err.message || 'Failed to create project. Please try again.'
  } finally {
    isCreatingProject.value = false
  }
}

// Computed property tính toán phần trăm băng thông
const bandwidthPercentage = computed(() => {
  const current = dashboardData.value?.profile?.current_usage_bytes ?? 0;
  const total = dashboardData.value?.profile?.total_allocated_bytes ?? 0;
  if (total === 0) return '0';
  const percentage = Math.min(100, (current / total) * 100);
  return percentage.toFixed(1);
})

// Helper format bytes
function formatBytes(bytes: number | null | undefined, decimals = 1) {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = bytes < 1 ? 0 : Math.floor(Math.log(bytes) / Math.log(k));
  if (i >= sizes.length) return 'Large Size';
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper lấy tên plan
function getPlanDisplayName(planType: string | null | undefined): string {
    if (!planType) return 'N/A';
    if (planType === 'free') return 'Free Plan';
    // Add more plan types if needed
    return planType.charAt(0).toUpperCase() + planType.slice(1);
}

// Watcher xử lý lỗi fetch
watch(error, (newError) => {
    if (newError) {
        console.error("Dashboard client fetch error:", newError);
        showToast(`Error loading dashboard: ${newError.data?.message || newError.message}`);
    }
});
</script>
