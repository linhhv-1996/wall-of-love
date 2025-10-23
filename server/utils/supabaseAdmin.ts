// server/utils/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase' // Đảm bảo bạn đã có file types

// Biến cache để lưu trữ client đã tạo
let supabaseAdminClientInstance: SupabaseClient<Database> | null = null;

/**
 * Tạo hoặc trả về một instance Supabase client duy nhất được cấu hình
 * với Secret Key để thực hiện các thao tác admin phía server.
 * Bỏ qua RLS. Chỉ sử dụng trong môi trường server.
 *
 * @returns {SupabaseClient<Database>} Supabase admin client instance
 * @throws {Error} Nếu thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY
 */
export const useSupabaseAdmin = (): SupabaseClient<Database> => {
  // Trả về instance đã cache nếu có
  if (supabaseAdminClientInstance) {
    return supabaseAdminClientInstance;
  }

  // Lấy cấu hình từ runtimeConfig (ưu tiên) hoặc process.env
  // Lưu ý: useRuntimeConfig() chỉ hoạt động trong context của request (event handler)
  //       hoặc trong lifecycle hooks của Nuxt.
  //       Để an toàn, đọc trực tiếp từ process.env là tốt nhất cho utility này.
  const supabaseUrl = process.env.SUPABASE_URL
  // Đọc trực tiếp từ process.env vì hàm này có thể được gọi ngoài context request
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    // Ném lỗi rõ ràng nếu thiếu cấu hình
    throw new Error('Supabase Admin Client: SUPABASE_URL or SUPABASE_SECRET_KEY is missing in environment variables.')
  }

  try {
    // Tạo client mới với Secret Key
    supabaseAdminClientInstance = createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        // Optional: Có thể thêm detectSessionInUrl: false nếu chắc chắn không bao giờ dùng
      }
    });
    console.log('Supabase Admin Client initialized successfully.'); // Log khi khởi tạo lần đầu
    return supabaseAdminClientInstance;
  } catch (error: any) {
    console.error('Failed to initialize Supabase Admin Client:', error.message);
    throw new Error(`Failed to initialize Supabase Admin Client: ${error.message}`);
  }
}

// Lưu ý: Mặc dù có cache instance, mỗi request serverless có thể chạy trong môi trường riêng,
// nên việc khởi tạo lại có thể xảy ra. Cache chủ yếu hiệu quả trong môi trường server chạy lâu dài.
