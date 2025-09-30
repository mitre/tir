<template>
  <div>
    <LoginBanner
      v-if="consentMode === 'modal'"
      v-model="showConsentModal"
      :consent-text="consentText"
      :title="loginBannerTitle"
      @confirm="handleConsent"
    />

    <div class="flex h-screen flex-1 flex-col justify-between px-6 py-8 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-40 w-40" src="../assets/TIR_Icon.svg" alt="Your Company" />
        <h1 class="mt-8 text-center text-3xl font-bold text-gray-800 dark:text-white">Welcome to TIR</h1>
        <h4 class="mt-5 text-center text-xl font-bold text-gray-800 dark:text-white">Sign in to your account</h4>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div class="sm:hidden">
            <label for="authMethods" class="sr-only">Select authentication method</label>
            <select
              id="authMethods"
              v-model="selectedAuthMethod"
              name="authMethods"
              class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base sm:text-sm"
            >
              <option v-for="method in authMethods" :key="method.name" :value="method.name">
                {{ method.name }}
              </option>
            </select>
          </div>

          <div class="hidden sm:block">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Authentication Methods">
                <div
                  v-for="method in authMethods"
                  :key="method.name"
                  :class="[
                    method.current
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  ]"
                  @click="selectedAuthMethod = method.name"
                >
                  {{ method.name }}
                </div>
              </nav>
            </div>
          </div>

          <div :class="{ 'pointer-events-none select-none opacity-50': loginDisabled }">
            <LoginForm
              :auth-method="selectedAuthMethod"
              :consent-mode="consentMode"
              :consent-text="consentText"
              :title="loginBannerTitle"
              :enabled-auth="enabledAuth"
            />
          </div>
        </div>
      </div>
      <div class="relative self-center">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "~/components/login/LoginForm.vue";
import Footer from "~/components/Footer.vue";
import LoginBanner from "~/components/login/LoginBanner.vue";

definePageMeta({ layout: false });

const { data: authStatus, error: authError } = await useFetch("/api/auth/authStatus", {
  lazy: false,
  server: true,
});

const enabledAuth = computed(() => authStatus.value || { local: true, ldap: false, oidc: false });

const consentMode = ref<"modal" | "checkbox" | "none">("none");
const consentText = ref("");
const showConsentModal = ref(false);
const loginDisabled = ref(false);
const loginBannerTitle = ref("");

const { data: loginBanner, error } = await useFetch("/api/config/loginBanner", {
  lazy: false,
  server: true,
});

if (loginBanner.value) {
  consentMode.value = loginBanner.value.mode || "none";
  consentText.value = loginBanner.value.html || "";
  loginBannerTitle.value = loginBanner.value.title || "";

  if (consentMode.value === "modal") {
    showConsentModal.value = true;
    loginDisabled.value = true;
  }
} else if (error.value) {
  console.error("Failed to load login banner", error.value);
}

const handleConsent = () => {
  showConsentModal.value = false;
  loginDisabled.value = false;
};

const authMethods = ref(
  [
    enabledAuth.value.local && { name: "Local", current: true },
    enabledAuth.value.ldap && { name: "LDAP", current: false },
  ].filter(Boolean),
);

const selectedAuthMethod = ref(authMethods.value.find((m) => m.current)?.name || "Local");

watch(selectedAuthMethod, (newMethod, oldMethod) => {
  const deselect = authMethods.value.find((m) => m.name === oldMethod);
  const select = authMethods.value.find((m) => m.name === newMethod);
  if (deselect) deselect.current = false;
  if (select) select.current = true;
});
</script>
