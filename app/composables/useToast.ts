// composables/useToast.ts
import { ref, readonly } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
  duration?: number
}

const toasts = ref<Toast[]>([])

let toastId = 0

export function useToast() {
  const showToast = (toast: { message: string, type?: 'success' | 'error', duration?: number }) => {
    const id = toastId++
    const newToast: Toast = {
      id,
      message: toast.message,
      type: toast.type || 'success',
      duration: toast.duration || 3000
    }
    toasts.value.push(newToast)

    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast
  }
}
