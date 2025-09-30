<template>
  <dl class="mb-6 space-y-6 divide-y divide-gray-100 border-b border-t border-gray-200 pb-6 pt-6 text-sm leading-6">
    <!-- Local Auth -->
    <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Local Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enable built-in username/password authentication.</p>
      </div>

      <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <!-- Enabled -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authLocal" class="ml-auto" />
        </div>

        <!-- Password rules -->
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Min Length</label>
          <input v-model.number="passwordLength" type="number" min="1" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Uppercase Letters</label>
          <input v-model.number="upperCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Lowercase Letters</label>
          <input v-model.number="lowerCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Numbers</label>
          <input v-model.number="numberCount" type="number" min="0" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Special Characters</label>
          <input v-model.number="specialCount" type="number" min="0" class="input-field" />
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
      <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authLdap" class="ml-auto" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">LDAP URL</label>
          <input v-model="ldapUrl" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Bind DN</label>
          <input v-model="ldapBindDn" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Password</label>
          <input
            v-model="ldapPassword"
            type="password"
            :placeholder="ldapPasswordSet ? '•••••• (set)' : ''"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Base DN</label>
          <input v-model="ldapBaseDn" type="text" class="input-field" />
        </div>
      </div>
    </dd>

    <!-- OIDC Auth -->
    <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">OIDC Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enable single sign-on using OpenID Connect (OIDC).</p>
      </div>
      <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="authOidc" class="ml-auto" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">OIDC URL</label>
          <input v-model="oidcUrl" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Client ID</label>
          <input v-model="oidcClientId" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Secret</label>
          <input
            v-model="oidcSecret"
            type="password"
            :placeholder="oidcSecretSet ? '•••••• (set)' : ''"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Callback URL</label>
          <input v-model="oidcCallback" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Group Mappings</label>
          <input v-model="oidcGroupMappings" type="text" class="input-field" placeholder="admin:1,users:2" />
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

const authLocal = ref(false);
const authLdap = ref(false);
const authOidc = ref(false);

const ldapUrl = ref("");
const ldapBindDn = ref("");
const ldapPassword = ref("");
const ldapBaseDn = ref("");
const ldapPasswordSet = ref(false);

const oidcUrl = ref("");
const oidcClientId = ref("");
const oidcSecret = ref("");
const oidcCallback = ref("");
const oidcGroupMappings = ref("");
const oidcSecretSet = ref(false);

const passwordLength = ref();
const upperCount = ref();
const lowerCount = ref();
const numberCount = ref();
const specialCount = ref();

onMounted(async () => {
  const config: AuthConfig = await $fetch("/api/config/authLoad");

  authLocal.value = config.authLocal;
  authLdap.value = config.authLdap;
  authOidc.value = config.authOidc;

  ldapUrl.value = config.ldapUrl;
  ldapBindDn.value = config.ldapBindDn;
  ldapBaseDn.value = config.ldapBaseDn;
  ldapPasswordSet.value = config.ldapPasswordSet;

  oidcUrl.value = config.oidcUrl;
  oidcClientId.value = config.oidcClientId;
  oidcCallback.value = config.oidcCallback;
  oidcGroupMappings.value = config.oidcGroupMappings;
  oidcSecretSet.value = config.oidcSecretSet;

  passwordLength.value = config.passwordLength;
  upperCount.value = config.upperCount;
  lowerCount.value = config.lowerCount;
  numberCount.value = config.numberCount;
  specialCount.value = config.specialCount;
});

const saveAuthConfig = async () => {
  await $fetch("/api/config/authSave", {
    method: "POST",
    body: {
      authLocal: authLocal.value,
      authLdap: authLdap.value,
      authOidc: authOidc.value,

      passwordLength: passwordLength.value,
      upperCount: upperCount.value,
      lowerCount: lowerCount.value,
      numberCount: numberCount.value,
      specialCount: specialCount.value,

      ldapUrl: ldapUrl.value,
      ldapBindDn: ldapBindDn.value,
      ldapBaseDn: ldapBaseDn.value,
      ...(ldapPassword.value && { ldapPassword: ldapPassword.value }),

      oidcUrl: oidcUrl.value,
      oidcClientId: oidcClientId.value,
      oidcCallback: oidcCallback.value,
      oidcGroupMappings: oidcGroupMappings.value,
      ...(oidcSecret.value && { oidcSecret: oidcSecret.value }),
    },
  });
};
</script>

<style scoped lang="postcss">
.input-field {
  @apply flex-1 rounded border px-2 py-1 text-sm 
    placeholder-gray-400 
    dark:bg-gray-800 dark:text-white 
    dark:placeholder-gray-500;
}
</style>
