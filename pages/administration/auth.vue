<template>
  <dl class="mb-6 space-y-6 divide-y divide-gray-100 border-b border-t border-gray-200 pb-6 pt-6 text-sm leading-6">
    <!-- Default Login Tab -->
    <dd
      v-if="authConfig"
      class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto"
    >
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Default Login Tab</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The tab pre-selected when users open the login page.
        </p>
      </div>
      <div class="flex flex-1 flex-wrap gap-4 text-gray-800 dark:text-white">
        <label class="flex cursor-pointer items-center gap-2">
          <input
            v-model="authConfig.defaultLoginProvider"
            type="radio"
            value="local"
            class="text-indigo-600"
          />
          <span class="text-sm">Local</span>
        </label>
        <label
          v-for="p in authConfig.ldap"
          :key="p.id"
          class="flex cursor-pointer items-center gap-2"
        >
          <input
            v-model="authConfig.defaultLoginProvider"
            type="radio"
            :value="`ldap:${p.id}`"
            class="text-indigo-600"
          />
          <span class="text-sm">{{ p.label }}</span>
        </label>
      </div>
    </dd>

    <!-- Local Auth -->
    <AuthLocalProvider
      v-if="authConfig"
      v-model:local="authConfig.local"
    />

    <!-- Dynamic provider sections -->
    <template v-if="authConfig">
      <AuthLDAPProvider
        v-for="(provider, idx) in authConfig.ldap"
        :key="provider.id"
        v-model:secret="providerSecrets[provider.id]"
        :provider="provider"
        @remove="removeLDAP(idx)"
      />
      <AuthOIDCProvider
        v-for="(provider, idx) in authConfig.oidc"
        :key="provider.id"
        v-model:secret="providerSecrets[provider.id]"
        :provider="provider"
        @remove="removeOIDC(idx)"
      />
      <AuthOAuthProvider
        v-for="(provider, idx) in authConfig.oauth"
        :key="provider.id"
        v-model:secret="providerSecrets[provider.id]"
        :provider="provider"
        @remove="removeOAuth(idx)"
      />
    </template>

    <!-- Add Provider button -->
    <dd class="flex justify-end pt-6">
      <div class="relative inline-block text-left">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="showProviderMenu = !showProviderMenu"
        >
          <span class="text-lg leading-none">+</span> Add Provider
        </button>

        <div
          v-if="showProviderMenu"
          class="absolute left-0 z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div class="py-1">
            <button
              type="button"
              class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="addLDAP"
            >
              LDAP
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="addOIDC"
            >
              OIDC
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="addOAuth"
            >
              OAuth 2.0
            </button>
          </div>
        </div>
      </div>
    </dd>

    <!-- Save button -->
    <div class="flex justify-end pt-6">
      <button
        type="button"
        class="text-sm font-semibold text-indigo-600 hover:bg-indigo-500"
        @click="saveAuthConfig"
      >
        Save
      </button>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { AuthConfig } from "~/types/auth";

definePageMeta({ layout: "admin" });

const authConfig = ref<AuthConfig>();
const providerSecrets = ref<Record<string, string>>({});
const showProviderMenu = ref(false);

onMounted(async () => {
  authConfig.value = await $fetch<AuthConfig>("/api/config/authLoad");
});

onMounted(() => {
  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".relative")) {
      showProviderMenu.value = false;
    }
  });
});

function nextId(prefix: string, existing: string[]): string {
  let i = 1;
  while (existing.includes(`${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
}

function callbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/auth/callback`;
}

function addLDAP() {
  if (!authConfig.value) return;
  showProviderMenu.value = false;
  const id = nextId("ldap", authConfig.value.ldap.map((p) => p.id));
  authConfig.value.ldap.push({
    id,
    label: "LDAP",
    template: "openldap",
    enable: false,
    url: "ldap://",
    bindDn: "",
    passwordSet: false,
    baseDn: "",
    ssl: false,
    sslInsecure: false,
    sslCa: "",
    groupAttribute: "memberOf",
    groupMappings: "",
  });
}

function removeLDAP(idx: number) {
  authConfig.value?.ldap.splice(idx, 1);
}

function addOIDC() {
  if (!authConfig.value) return;
  showProviderMenu.value = false;
  const id = nextId("oidc", authConfig.value.oidc.map((p) => p.id));
  authConfig.value.oidc.push({
    id,
    label: "OIDC",
    enable: false,
    url: "",
    clientId: "",
    secretSet: false,
    callback: callbackUrl(),
    groupMappings: "",
    groupClaimType: "claim",
    groupClaimPath: "groups",
    sslInsecure: false,
  });
}

function removeOIDC(idx: number) {
  authConfig.value?.oidc.splice(idx, 1);
}

function addOAuth() {
  if (!authConfig.value) return;
  showProviderMenu.value = false;
  const id = nextId("oauth", authConfig.value.oauth.map((p) => p.id));
  authConfig.value.oauth.push({
    id,
    label: "OAuth 2.0",
    providerType: "github",
    enable: false,
    baseUrl: "",
    clientId: "",
    secretSet: false,
    callback: callbackUrl(),
    groupMappings: "",
    authorizationUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    groupClaimPath: "",
  });
}

function removeOAuth(idx: number) {
  authConfig.value?.oauth.splice(idx, 1);
}

async function saveAuthConfig() {
  if (!authConfig.value) return;

  const body = {
    defaultLoginProvider: authConfig.value.defaultLoginProvider,
    local: authConfig.value.local,
    ldap: authConfig.value.ldap.map((p) => ({
      ...p,
      ...(providerSecrets.value[p.id] ? { password: providerSecrets.value[p.id] } : {}),
    })),
    oidc: authConfig.value.oidc.map((p) => ({
      ...p,
      ...(providerSecrets.value[p.id] ? { secret: providerSecrets.value[p.id] } : {}),
    })),
    oauth: authConfig.value.oauth.map((p) => ({
      ...p,
      ...(providerSecrets.value[p.id] ? { secret: providerSecrets.value[p.id] } : {}),
    })),
  };

  await $fetch("/api/config/authSave", { method: "POST", body });

  providerSecrets.value = {};
  authConfig.value = await $fetch<AuthConfig>("/api/config/authLoad");
}
</script>
