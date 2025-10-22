<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div>
          <p class="text-sm font-medium text-gray-700">Sign in with</p>
          <div class="mt-1 grid grid-cols-1 gap-3">
            <div>
              <button
                @click="signInWithGoogle"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.736 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clip-rule="evenodd" />
                </svg>
                <span class="ml-2">Google</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form class="mt-6 space-y-6" @submit.prevent="signInWithMagicLink">
           <p v-if="magicLinkMessage" class="text-sm text-green-600">{{ magicLinkMessage }}</p>
          <div>
            <label for="email-magic" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input v-model="email" id="email-magic" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
           <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
              {{ loading ? 'Sending...' : 'Send Magic Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('');
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const magicLinkMessage = ref<string | null>(null);

const supabase = useSupabaseClient();
const router = useRouter();

// --- Social Login ---
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: `${window.location.origin}/confirm` // Quan trọng!
    }
  });
  if (error) {
    errorMessage.value = error.message;
  }
};

// --- Magic Link Login ---
const signInWithMagicLink = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    magicLinkMessage.value = null;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        // Link trong email sẽ trỏ về đây, sau đó Supabase sẽ xử lý session
        // và chuyển hướng đến trang dashboard nhờ watchEffect
        emailRedirectTo: `${window.location.origin}/confirm`,
      }
    });

    if (error) {
      errorMessage.value = error.message;
    } else {
      magicLinkMessage.value = 'Check your email for the magic link!';
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
};

// --- Redirect user if already logged in ---
const user = useSupabaseUser();
watchEffect(() => {
  if (user.value) {
    router.push('/dashboard');
  }
});
</script>
