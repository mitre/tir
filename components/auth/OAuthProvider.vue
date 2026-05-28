<template>
  <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
    <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
      <div class="text-lg font-medium">{{ provider.label }}</div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">OAuth 2.0</p>
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
        <label class="w-48 text-left text-sm font-medium">Provider</label>
        <select
          v-model="provider.providerType"
          class="input-field"
        >
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div
        v-if="provider.providerType === 'gitlab'"
        class="flex items-center gap-4"
      >
        <label class="w-48 text-left text-sm font-medium">GitLab URL</label>
        <input
          v-model="provider.baseUrl"
          type="text"
          placeholder="https://gitlab.com"
          class="input-field"
        />
      </div>
      <template v-if="provider.providerType === 'custom'">
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Authorization URL</label>
          <input
            v-model="provider.authorizationUrl"
            type="text"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Token URL</label>
          <input
            v-model="provider.tokenUrl"
            type="text"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">User Info URL</label>
          <input
            v-model="provider.userInfoUrl"
            type="text"
            class="input-field"
          />
        </div>
      </template>
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
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Group Mappings</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupMappings"
            type="text"
            :placeholder="mappingPlaceholder"
            class="input-field"
          />
          <p class="text-xs text-gray-400">
            {{ mappingHint }}
            Leave empty to grant all authenticated users the User role.
          </p>
        </div>
      </div>
      <div
        v-if="provider.providerType === 'custom'"
        class="flex items-center gap-4"
      >
        <label class="w-48 text-left text-sm font-medium">Group Claim Path</label>
        <div class="flex flex-1 flex-col gap-1">
          <input
            v-model="provider.groupClaimPath"
            type="text"
            placeholder="groups"
            class="input-field"
          />
          <p class="text-xs text-gray-400">Dot-notation path to the groups array in the user info response.</p>
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
          title="Requires saved config — opens a popup to run the full OAuth login flow without affecting your current session"
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
import type { OAuthProviderConfig, ConnectionTestResult, LoginTestResult } from "~/types/auth";

const provider = defineModel<OAuthProviderConfig>("provider", { required: true });
const secret = defineModel<string>("secret", { default: "" });
defineEmits<{ remove: [] }>();

const connectionTest = ref<ConnectionTestResult>();
const loginTest = ref<LoginTestResult>();

const placeholders: Record<string, string> = {
  github: "myorg/teamslug:1,myorg/devs:2",
  gitlab: "my-group:1,parent/child-group:2",
  bitbucket: "my-workspace:1",
  custom: "admin:1,developers:2",
};
const hints: Record<string, string> = {
  github: "Format: org/teamslug:roleId —",
  gitlab: "Format: group-path:roleId (nested groups: parent/child:roleId) —",
  bitbucket: "Format: workspace-slug:roleId —",
  custom: "Format: groupname:roleId —",
};

const mappingPlaceholder = computed(() => placeholders[provider.value.providerType] ?? "group:roleId");
const mappingHint = computed(() => hints[provider.value.providerType] ?? "Format: identifier:roleId —");

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
    const result = await $fetch<{ ok: boolean; checks: ConnectionTestResult["checks"] }>("/api/auth/test/oauth", {
      method: "POST",
      body: {
        providerType: provider.value.providerType,
        baseUrl: provider.value.baseUrl,
        authorizationUrl: provider.value.authorizationUrl,
        tokenUrl: provider.value.tokenUrl,
        userInfoUrl: provider.value.userInfoUrl,
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
    `/api/auth/login/oauth?provider=${encodeURIComponent(provider.value.id)}&test=true`,
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
