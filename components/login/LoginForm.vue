<template>
  <form class="space-y-2" @submit.prevent>
    <div>
      <label for="username" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
        Username
      </label>
      <div class="mt-2">
        <input
          id="text"
          v-model="userInput.username"
          name="text"
          type="text"
          autocomplete="text"
          required
          class="block w-full rounded-md border-0 bg-white py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/20 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between">
        <label for="password" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Password
        </label>
      </div>
      <div class="mt-2">
        <input
          id="password"
          v-model="userInput.passwordField"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="block w-full rounded-md border-0 bg-white py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/20 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <fieldset v-if="props.consentMode === 'checkbox'">
      <div class="space-y-5">
        <div class="relative flex items-start">
          <div class="flex h-6 items-center">
            <input
              id="consent-checkbox"
              v-model="userInput.agree"
              required
              type="checkbox"
              class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div class="ml-3 text-sm leading-6">
            <label for="consent-checkbox" class="font-medium text-gray-500">
              I agree to the terms of the
              <a
                class="cursor-pointer font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
                @click="open = true"
              >
                {{ props.title }}
              </a>
            </label>
          </div>
        </div>
      </div>
    </fieldset>

    <LoginBanner
      v-if="props.consentMode === 'checkbox'"
      v-model="open"
      :consent-text="props.consentText || ''"
      :title="props.title || ''"
      @confirm="open = false"
    />

    <div>
      <button
        type="submit"
        :disabled="missingConsent"
        :title="missingConsent ? 'You must agree to the terms before continuing.' : ''"
        :class="[
          'flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          missingConsent
            ? 'cursor-not-allowed bg-indigo-300 text-white'
            : 'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500',
        ]"
        @click="loginUser"
      >
        Sign in
      </button>
    </div>

    <LoginFailed :show="dialogOpen" :dialog-open="dialogOpen" :message="errorMessage" @change="dialogOpen = false" />
  </form>

  <!-- Single Sign On Buttons -->
  <template v-if="props.ssoProviders.length > 0">
    <div class="my-4">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-gray-100 px-4 text-gray-500 dark:bg-gray-900">or sign in with</span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <button
        v-for="provider in props.ssoProviders"
        :key="provider.id"
        type="button"
        :disabled="missingConsent"
        :title="missingConsent ? 'You must agree to the terms before continuing.' : ''"
        :class="[
          'flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          missingConsent
            ? 'cursor-not-allowed bg-indigo-300 text-white'
            : 'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500',
        ]"
        @click="ssoLogin(provider.href)"
      >
        {{ provider.label }}
      </button>
    </div>
  </template>
</template>

<script setup lang="ts">
import LoginFailed from "./LoginFailed.vue";
import LoginBanner from "~/components/login/LoginBanner.vue";

const props = defineProps({
  authMethod: {
    type: Object as PropType<{ type: string; providerId?: string }>,
    required: true,
  },
  consentMode: {
    type: String,
    default: "checkbox",
    validator: (val: string) => ["checkbox", "modal", "none"].includes(val),
  },
  consentText: { type: String, required: false, default: "" },
  title: { type: String, required: false, default: "Login Banner" },
  ssoProviders: {
    type: Array as PropType<{ id: string; label: string; href: string }[]>,
    required: false,
    default: () => [],
  },
});

const open = ref(false);
const userInput = ref({ username: "", passwordField: "", agree: false });
const errorMessage = ref("");
const dialogOpen = ref(false);

const missingConsent = computed(() => props.consentMode === "checkbox" && !userInput.value.agree);

const router = useRouter();

async function loginUser() {
  let data, error;

  if (props.authMethod.type === "local") {
    ({ data, error } = await useFetch("/api/auth/login/local", {
      method: "POST",
      body: {
        email: userInput.value.username.toLowerCase(),
        password: userInput.value.passwordField,
      },
    }));
  } else if (props.authMethod.type === "ldap") {
    const url = props.authMethod.providerId
      ? `/api/auth/login/ldap?provider=${encodeURIComponent(props.authMethod.providerId)}`
      : "/api/auth/login/ldap";
    ({ data, error } = await useFetch(url, {
      method: "POST",
      body: {
        credentials: {
          username: userInput.value.username.toLowerCase(),
          password: userInput.value.passwordField,
        },
      },
    }));
  }

  if (error?.value || data?.value?.success === false) {
    errorMessage.value = data?.value?.message || "Login failed. Please try again.";
    dialogOpen.value = true;
    return;
  }

  router.push("/home");
}

function ssoLogin(href: string) {
  globalThis.location.href = globalThis.location.origin + href;
}
</script>
