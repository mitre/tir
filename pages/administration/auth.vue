<template>
  <dl class="mb-6 space-y-6 divide-y divide-gray-100 border-b border-t border-gray-200 pb-6 pt-6 text-sm leading-6">
    <!-- Local Auth -->
    <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Local Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enable built-in username/password authentication.</p>
      </div>

      <div v-if="authConfig" class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <!-- Enabled -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authConfig.local.enable" class="ml-auto" />
        </div>

        <!-- Password rules -->
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Min Length</label>
          <input v-model.number="authConfig.local.passwordLength" type="number" min="1" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Uppercase Letters</label>
          <input v-model.number="authConfig.local.upperCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Lowercase Letters</label>
          <input v-model.number="authConfig.local.lowerCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Numbers</label>
          <input v-model.number="authConfig.local.numberCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Special Characters</label>
          <input v-model.number="authConfig.local.specialCount" type="number" min="0" class="input-field" />
        </div>
      </div>
    </dd>

    <!-- LDAP Auth -->
    <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">LDAP Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enable LDAP authentication for enterprise directory login.
        </p>
      </div>
      <div v-if="authConfig" class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authConfig.ldap.enable" class="ml-auto" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">LDAP URL</label>
          <input v-model="authConfig.ldap.url" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Bind DN</label>
          <input v-model="authConfig.ldap.bindDn" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Password</label>
          <input
            v-model="ldapPassword"
            type="password"
            :placeholder="authConfig.ldap.passwordSet ? '•••••• (set)' : ''"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Base DN</label>
          <input v-model="authConfig.ldap.baseDn" type="text" class="input-field" />
        </div>
      </div>
    </dd>

    <!-- OIDC Auth -->
    <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">OIDC Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enable single sign-on using OpenID Connect (OIDC).</p>
      </div>
      <div v-if="authConfig" class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authConfig.oidc.enable" class="ml-auto" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">OIDC URL</label>
          <input v-model="authConfig.oidc.url" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Client ID</label>
          <input v-model="authConfig.oidc.clientId" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Secret</label>
          <input
            v-model="oidcSecret"
            type="password"
            :placeholder="authConfig.oidc.secretSet ? '•••••• (set)' : ''"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Callback URL</label>
          <input v-model="authConfig.oidc.callback" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Group Mappings</label>
          <input
            v-model="authConfig.oidc.groupMappings"
            type="text"
            class="input-field"
            placeholder="admin:1,users:2"
          />
        </div>
      </div>
    </dd>

    <!-- Save button -->
    <div class="flex justify-end pt-6">
      <button type="button" class="text-sm font-semibold text-indigo-600 hover:bg-indigo-500" @click="saveAuthConfig">
        Save
      </button>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { AuthConfig } from "~/types/auth";

definePageMeta({ layout: "admin" });

const authConfig = ref<AuthConfig>();
const oidcSecret = ref<string>("");
const ldapPassword = ref<string>("");

onMounted(async () => {
  const config: AuthConfig = await $fetch("/api/config/authLoad");

  authConfig.value = config;
});

async function saveAuthConfig() {
  if (!authConfig.value) return;

  const body: any = {
    local: authConfig.value.local,
    ldap: {
      ...authConfig.value.ldap,
      ...(ldapPassword.value ? { password: ldapPassword.value } : {}),
    },
    oidc: {
      ...authConfig.value.oidc,
      ...(oidcSecret.value ? { secret: oidcSecret.value } : {}),
    },
  };

  await $fetch("/api/config/authSave", {
    method: "POST",
    body,
  });

  oidcSecret.value = "";
  ldapPassword.value = "";

  const updatedConfig = await $fetch("/api/config/authLoad");
  authConfig.value = updatedConfig;
}
</script>

<style scoped lang="postcss">
.input-field {
  @apply flex-1 rounded border px-2 py-1 text-sm 
    placeholder-gray-400 
    dark:bg-gray-800 dark:text-white 
    dark:placeholder-gray-500;
}
</style>
