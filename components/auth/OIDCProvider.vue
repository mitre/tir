<template>
  <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
    <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
      <div class="text-lg font-medium">{{ provider.label }}</div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">OpenID Connect</p>
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
      <div class="flex items-start gap-4">
        <label class="w-48 pt-1 text-left text-sm font-medium">Discovery URL</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.url"
            type="text"
            class="input-field"
          />
          <p
            v-if="provider.url?.startsWith('http://')"
            class="text-xs text-amber-500"
          >
            HTTP detected — certificate verification is disabled for this provider. Use HTTPS in production.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Client ID</label>
        <input
          v-model="provider.clientId"
          type="text"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Client Secret</label>
        <input
          v-model="secret"
          type="password"
          :placeholder="provider.secretSet ? '•••••• (set)' : 'Enter secret'"
          class="input-field"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Callback URL</label>
        <div class="flex flex-1 gap-2">
          <input
            v-model="provider.callback"
            type="text"
            class="input-field"
          />
          <button
            type="button"
            class="shrink-0 rounded border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Fill with this server's callback URL"
            @click="provider.callback = callbackUrl()"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="h-3 w-3"
            />
            Fill
          </button>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <label class="w-48 pt-1 text-left text-sm font-medium">Skip SSL Verification</label>
        <div class="flex flex-1 flex-col gap-1">
          <UISlideSwitch v-model="provider.sslInsecure" />
          <p
            v-if="provider.sslInsecure"
            class="text-xs text-amber-500"
          >
            Disables TLS certificate verification. For development with self-signed certificates only.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Group Source</label>
        <select
          v-model="provider.groupClaimType"
          class="input-field"
        >
          <option value="claim">Standard Claim (Keycloak, Okta, Auth0…)</option>
          <option value="scope">Custom Scope (TIR-specific)</option>
        </select>
      </div>
      <div
        v-if="provider.groupClaimType === 'claim'"
        class="flex items-center gap-4"
      >
        <label class="w-48 text-left text-sm font-medium">Claim Path</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupClaimPath"
            type="text"
            placeholder="groups"
            class="input-field"
          />
          <p class="text-xs text-gray-400">
            Common paths: <code>groups</code> · <code>realm_access.roles</code> ·
            <code>resource_access.&lt;clientId&gt;.roles</code>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Group Mappings</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupMappings"
            type="text"
            placeholder="admin:1,users:2"
            class="input-field"
          />
          <p class="text-xs text-gray-400">
            Format: <code>groupName:roleId</code> — comma-separated. RoleId 1=Admin, 2=User.
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
          :disabled="loginTest?.loading"
          class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Requires saved config — opens a popup to run the full OIDC login flow without affecting your current session"
          @click="testLogin"
        >
          {{ loginTest?.loading ? "Waiting…" : "Test Login" }}
        </button>
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
import type { OIDCProviderConfig, ConnectionTestResult, LoginTestResult } from "~/types/auth";

const provider = defineModel<OIDCProviderConfig>("provider", { required: true });
const secret = defineModel<string>("secret", { default: "" });
defineEmits<{ remove: [] }>();

const connectionTest = ref<ConnectionTestResult>();
const loginTest = ref<LoginTestResult>();

function callbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/auth/callback`;
}

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || data.type !== "tir_test_login" || data.providerId !== provider.value.id) return;
  if (data.error) {
    loginTest.value = { loading: false, error: data.error };
  } else {
    loginTest.value = { loading: false, email: data.email, firstName: data.firstName, lastName: data.lastName, groups: data.groups, userRoleId: data.userRoleId, denied: data.denied };
  }
}

onMounted(() => window.addEventListener("message", onMessage));
onUnmounted(() => window.removeEventListener("message", onMessage));

async function testConnection() {
  connectionTest.value = { loading: true };
  try {
    const result = await $fetch<{ ok: boolean; checks: ConnectionTestResult["checks"] }>("/api/auth/test/oidc", {
      method: "POST",
      body: {
        id: provider.value.id,
        url: provider.value.url,
        clientId: provider.value.clientId,
        secret: secret.value || undefined,
        callback: provider.value.callback,
        sslInsecure: provider.value.sslInsecure,
      },
    });
    connectionTest.value = { loading: false, checks: result.checks };
  } catch (err: any) {
    connectionTest.value = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

function testLogin() {
  loginTest.value = { loading: true };
  window.open(
    `/api/auth/login/oidc?provider=${encodeURIComponent(provider.value.id)}&test=true`,
    "tir_test_login",
    "width=600,height=700",
  );
}
</script>

<style scoped lang="postcss">
.input-field {
  @apply flex-1 rounded border px-2 py-1 text-sm placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500;
}
</style>
