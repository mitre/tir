<template>
  <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
    <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
      <div class="text-lg font-medium">{{ provider.label }}</div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">LDAP</p>
      <button
        type="button"
        class="mt-2 text-xs text-red-500 hover:text-red-700"
        @click="$emit('remove')"
      >
        Remove
      </button>
    </div>
    <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
      <div class="flex items-center gap-4">
        <label class="w-24 text-left text-sm font-medium">Enabled</label>
        <UISlideSwitch
          v-model="provider.enable"
          class="ml-auto"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Label</label>
        <input
          v-model="provider.label"
          type="text"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Directory Type</label>
        <select
          v-model="provider.template"
          class="input-field"
        >
          <option value="openldap">OpenLDAP</option>
          <option value="msad">MS Active Directory</option>
        </select>
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">URL</label>
        <input
          v-model="provider.url"
          type="text"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Bind DN</label>
        <input
          v-model="provider.bindDn"
          type="text"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Password</label>
        <input
          v-model="secret"
          type="password"
          :placeholder="provider.passwordSet ? '•••••• (set)' : 'Enter password'"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Base DN</label>
        <input
          v-model="provider.baseDn"
          type="text"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Use SSL/TLS</label>
        <UISlideSwitch
          v-model="provider.ssl"
          class="ml-auto"
        />
      </div>
      <template v-if="provider.ssl">
        <div class="flex items-start gap-4">
          <label class="w-48 pt-1 text-left text-sm font-medium">CA Certificate</label>
          <div class="flex flex-1 flex-col gap-1">
            <textarea
              v-model="provider.sslCa"
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              rows="4"
              class="input-field font-mono text-xs"
            />
            <p class="text-xs text-gray-400">Paste the CA or self-signed certificate here for full verification.</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <label class="w-48 pt-1 text-left text-sm font-medium">Skip Verification</label>
          <div class="flex flex-1 flex-col gap-1">
            <UISlideSwitch v-model="provider.sslInsecure" />
            <p class="text-xs text-amber-500">
              Disables all certificate verification. Vulnerable to man-in-the-middle attacks. Use the CA Certificate
              field if you want to allow self-signed certificate.
            </p>
          </div>
        </div>
      </template>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Group Attribute</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupAttribute"
            type="text"
            placeholder="memberOf"
            class="input-field"
          />
          <p class="text-xs text-gray-400">
            LDAP attribute holding group memberships. Default: <code>memberOf</code>
            (works for AD and OpenLDAP with memberOf overlay).
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Group Mappings</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupMappings"
            type="text"
            placeholder="cn=admins,ou=groups,dc=example,dc=com:1|cn=staff,ou=groups,dc=example,dc=com:2"
            class="input-field"
          />
          <p class="text-xs text-gray-400">
            Format: <code>fullDN:roleId</code> — pipe-separated. RoleId 1=Admin, 2=User. Leave empty to grant all
            authenticated users the User role.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          type="button"
          :disabled="connectionTest?.loading"
          class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="testConnection"
        >
          {{ connectionTest?.loading ? "Testing…" : "Test Connection" }}
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="toggleLoginForm"
        >
          Test Login
        </button>
      </div>

      <div
        v-if="loginForm.visible"
        class="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center gap-3">
          <label class="w-24 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">Username</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="jsmith"
            class="input-field text-xs"
            @keyup.enter="testLogin"
          />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-24 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
          <input
            v-model="loginForm.testPassword"
            type="password"
            placeholder="User's password"
            class="input-field text-xs"
            @keyup.enter="testLogin"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            :disabled="loginTest?.loading"
            class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="testLogin"
          >
            {{ loginTest?.loading ? "Testing…" : "Run Test" }}
          </button>
        </div>
      </div>

      <AuthConnectionTestResult :result="connectionTest" />
      <AuthLoginTestResult
        v-if="loginTest && !loginTest.loading"
        :result="loginTest"
      />
    </div>
  </dd>
</template>

<script setup lang="ts">
import type { LDAPProviderConfig, ConnectionTestResult, LoginTestResult } from "~/types/auth";

const provider = defineModel<LDAPProviderConfig>("provider", { required: true });
const secret = defineModel<string>("secret", { default: "" });
defineEmits<{ remove: [] }>();

const connectionTest = ref<ConnectionTestResult>();
const loginTest = ref<LoginTestResult>();
const loginForm = ref({ visible: false, username: "", testPassword: "" });

function toggleLoginForm() {
  loginForm.value.visible = !loginForm.value.visible;
}

async function testConnection() {
  connectionTest.value = { loading: true };
  try {
    const result = await $fetch<{ ok: boolean; checks: ConnectionTestResult["checks"] }>("/api/auth/test/ldap", {
      method: "POST",
      body: {
        id: provider.value.id,
        url: provider.value.url,
        bindDn: provider.value.bindDn,
        password: secret.value || undefined,
        baseDn: provider.value.baseDn,
        ssl: provider.value.ssl,
        sslInsecure: provider.value.sslInsecure,
        sslCa: provider.value.sslCa,
      },
    });
    connectionTest.value = { loading: false, checks: result.checks };
  } catch (err: any) {
    connectionTest.value = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

async function testLogin() {
  const form = loginForm.value;
  if (!form.username || !form.testPassword) return;
  loginTest.value = { loading: true };
  try {
    const result = await $fetch<Omit<LoginTestResult, "loading"> & { ok: boolean }>("/api/auth/test/ldap-login", {
      method: "POST",
      body: {
        id: provider.value.id,
        url: provider.value.url,
        bindDn: provider.value.bindDn,
        password: secret.value || undefined,
        baseDn: provider.value.baseDn,
        ssl: provider.value.ssl,
        sslInsecure: provider.value.sslInsecure,
        sslCa: provider.value.sslCa,
        template: provider.value.template,
        groupAttribute: provider.value.groupAttribute,
        groupMappings: provider.value.groupMappings,
        username: form.username,
        testPassword: form.testPassword,
      },
    });
    loginTest.value = { loading: false, ...result };
  } catch (err: any) {
    loginTest.value = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}
</script>

<style scoped lang="postcss">
.input-field {
  @apply flex-1 rounded border px-2 py-1 text-sm placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500;
}
</style>
