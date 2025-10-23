// composables/useToast.ts (ĐÃ SỬA LỖI CONTEXT)

import { type Ref } from 'vue'

// 1. Tạo biến cache (singleton) ở top-level,
//    NHƯNG để là null.
let toastMessageState: Ref<string> | null = null
let toastTimer: any = null

// 2. Hàm helper để lấy (hoặc tạo) state
function getToastState() {
  // 3. Chỉ khi state chưa tồn tại...
  if (!toastMessageState) {
    // 4. ...THÌ MỚI GỌI useState()
    //    (Lúc này nó được gọi TỪ BÊN TRONG 
    //     useToast/useToastState, nên đã có context)
    toastMessageState = useState<string>('toastMessage', () => '')
  }
  return toastMessageState
}

/**
 * Composable DÙNG ĐỂ GỌI (SHOW) TOAST.
 * (Dùng trong pages/login.vue)
 */
export const useToast = () => {
  // 5. Lấy state (hoặc tạo mới nếu là lần đầu)
  const state = getToastState()

  const showToast = (msg: string, duration: number = 2500) => {
    state.value = msg
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      state.value = ''
    }, duration)
  }
  
  return { showToast }
}

/**
 * Composable DÙNG ĐỂ ĐỌC (DISPLAY) STATE.
 * (Dùng trong components/GlobalToast.vue)
 */
export const useToastState = () => {
  // 5. Lấy state (hoặc tạo mới nếu là lần đầu)
  const state = getToastState()

  // 6. Trả về
  return readonly(state)
}
