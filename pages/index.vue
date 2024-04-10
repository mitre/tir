<script setup>
import { ref, watch } from "vue";
import LoginForm from "../components/login/LoginForm.vue";

const config = useRuntimeConfig();
const ldapEnabled = config.public.ldap_enabled === "true" || config.public.ldap_enabled === true;
const ldapEnabledRaw = config.public.ldap_enabled;
const ldaphost = config.ldap_host;

console.log(`Type of ldapEnabledRaw: ${typeof ldapEnabledRaw}`);
console.log(`ldapEnabledRaw: ${ldapEnabledRaw}`);
console.log(`ldapEnabled: ${ldapEnabled}`);
console.log(`ldapHost: ${ldaphost}`);

definePageMeta({
  layout: false,
});

const authMethods = ref([
  { name: "Local", current: !ldapEnabled },
  ...(ldapEnabled ? [{ name: "LDAP", current: ldapEnabled }] : []),
]);
const selectedAuthMethod = ref(authMethods.value.find((method) => method.current).name);
watch(selectedAuthMethod, (newMethod, oldMethod) => {
  const methodToDeselect = authMethods.value.find((method) => method.name === oldMethod);
  if (methodToDeselect) {
    methodToDeselect.current = false;
  }
  const methodToSelect = authMethods.value.find((method) => method.name === newMethod);
  if (methodToSelect) {
    methodToSelect.current = true;
  }
});
</script>

<template>
  <div class="flex h-screen flex-1 flex-col justify-between px-6 py-8 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-40 w-40" src="../assets/TIR_Icon.svg" alt="Your Company" />
      <h1 class="mt-8 text-center text-3xl font-bold leading-9 tracking-tight text-gray-800 dark:text-white">
        Welcome to TIR
      </h1>
      <h4 class="mt-5 text-center text-xl font-bold leading-9 tracking-tight text-gray-800 dark:text-white">
        Sign in to your account
      </h4>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div class="sm:hidden">
          <label for="authMethods" class="sr-only">Select an authentication method</label>
          <select
            id="authMethods"
            v-model="selectedAuthMethod"
            name="authMethods"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option v-for="authMethod in authMethods" :key="authMethod.name" :value="authMethod.name">
              {{ authMethod.name }}
            </option>
          </select>
        </div>
        <div class="hidden sm:block">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Authentication Methods">
              <div
                v-for="authMethod in authMethods"
                :key="authMethod.name"
                :class="[
                  authMethod.current
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                ]"
                @click="selectedAuthMethod = authMethod.name"
              >
                {{ authMethod.name }}
              </div>
            </nav>
          </div>
        </div>
        <LoginForm :auth-method="selectedAuthMethod" />
      </div>
    </div>
    <div class="relative self-center">
      <Footer />
    </div>
  </div>
</template>
