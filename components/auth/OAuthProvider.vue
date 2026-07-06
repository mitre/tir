<template>
  <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
    <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
      <div class="text-lg font-medium">{{ provider.label }}</div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">OAuth 2.0</p>
    </div>
    <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-enable`"
          class="w-24 text-left text-sm font-medium"
          >Enabled</label
        >
        <div class="ml-auto flex items-center gap-2">
          <UIRemoveProviderConfirm
            :name="provider.label"
            as-icon
            @remove="$emit('remove')"
          />
          <UISlideSwitch
            :id="`oauth-${provider.id}-enable`"
            v-model="provider.enable"
          />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-label`"
          class="w-48 text-left text-sm font-medium"
          >Label</label
        >
        <AppInput
          :id="`oauth-${provider.id}-label`"
          v-model="provider.label"
          type="text"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-provider-type`"
          class="w-48 text-left text-sm font-medium"
          >Provider</label
        >
        <AppSelect
          :id="`oauth-${provider.id}-provider-type`"
          v-model="provider.providerType"
          class="flex-1"
        >
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
          <option value="custom">Custom</option>
        </AppSelect>
      </div>
      <div
        v-if="provider.providerType === 'gitlab'"
        class="flex items-center gap-4"
      >
        <label
          :for="`oauth-${provider.id}-base-url`"
          class="w-48 text-left text-sm font-medium"
          >GitLab URL</label
        >
        <AppInput
          :id="`oauth-${provider.id}-base-url`"
          v-model="provider.baseUrl"
          type="text"
          placeholder="https://gitlab.com"
          class="flex-1"
        />
      </div>
      <template v-if="provider.providerType === 'custom'">
        <div class="flex items-center gap-4">
          <label
            :for="`oauth-${provider.id}-authorization-url`"
            class="w-48 text-left text-sm font-medium"
            >Authorization URL</label
          >
          <AppInput
            :id="`oauth-${provider.id}-authorization-url`"
            v-model="provider.authorizationUrl"
            type="text"
            class="flex-1"
          />
        </div>
        <div class="flex items-center gap-4">
          <label
            :for="`oauth-${provider.id}-token-url`"
            class="w-48 text-left text-sm font-medium"
            >Token URL</label
          >
          <AppInput
            :id="`oauth-${provider.id}-token-url`"
            v-model="provider.tokenUrl"
            type="text"
            class="flex-1"
          />
        </div>
        <div class="flex items-center gap-4">
          <label
            :for="`oauth-${provider.id}-user-info-url`"
            class="w-48 text-left text-sm font-medium"
            >User Info URL</label
          >
          <AppInput
            :id="`oauth-${provider.id}-user-info-url`"
            v-model="provider.userInfoUrl"
            type="text"
            class="flex-1"
          />
        </div>
      </template>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-client-id`"
          class="w-48 text-left text-sm font-medium"
          >Client ID</label
        >
        <AppInput
          :id="`oauth-${provider.id}-client-id`"
          v-model="provider.clientId"
          type="text"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-client-secret`"
          class="w-48 text-left text-sm font-medium"
          >Client Secret</label
        >
        <AppInput
          :id="`oauth-${provider.id}-client-secret`"
          v-model="secret"
          type="password"
          :placeholder="provider.secretSet ? '•••••• (set)' : 'Enter secret'"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-callback`"
          class="w-48 text-left text-sm font-medium"
          >Callback URL</label
        >
        <div class="flex flex-1 flex-col gap-1">
          <div class="flex gap-2">
            <AppInput
              :id="`oauth-${provider.id}-callback`"
              v-model="provider.callback"
              type="text"
              class="flex-1"
            />
            <UITooltip text="Fill with this server's callback URL">
              <button
                type="button"
                class="shrink-0 rounded border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                @click="provider.callback = callbackUrl()"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="h-3 w-3"
                />
                Fill
              </button>
            </UITooltip>
          </div>
          <p class="text-xs text-gray-400">
            The default value usually works as-is. Register this URL as an allowed callback/redirect URL with your
            identity provider.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <label
          :for="`oauth-${provider.id}-group-mappings`"
          class="w-48 text-left text-sm font-medium"
          >Group Mappings</label
        >
        <div class="flex flex-1 flex-col gap-1">
          <AppInput
            :id="`oauth-${provider.id}-group-mappings`"
            v-model="provider.groupMappings"
            type="text"
            :placeholder="mappingPlaceholder"
            class="w-full"
          />
          <p class="text-xs text-gray-400">
            {{ mappingHint }} RoleId 1=Admin, 2=User. Leave empty to grant all authenticated users the User role.
          </p>
        </div>
      </div>
      <div
        v-if="provider.providerType === 'custom'"
        class="flex items-center gap-4"
      >
        <label
          :for="`oauth-${provider.id}-group-claim-path`"
          class="w-48 text-left text-sm font-medium"
          >Group Claim Path</label
        >
        <div class="flex flex-1 flex-col gap-1">
          <AppInput
            :id="`oauth-${provider.id}-group-claim-path`"
            v-model="provider.groupClaimPath"
            type="text"
            placeholder="groups"
            class="w-full"
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
        <UITooltip
          :ui="{
            width: 'max-w-none'
          }"
        >
          <span class="inline-flex">
            <button
              type="button"
              :disabled="loginTest?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="testLogin"
            >
              {{ loginTest?.loading ? "Waiting…" : "Test Login" }}
            </button>
          </span>

          <template #text>
            <span class="whitespace-nowrap">
              Requires saved config — opens a popup to run the full OAuth login flow without affecting your current session
            </span>
          </template>
        </UITooltip>
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
  if (globalThis.window === undefined) return "";
  return `${globalThis.location.origin}/api/auth/callback`;
}

function onMessage(event: MessageEvent) {
  if (event.origin !== globalThis.location.origin) return;
  const data = event.data;
  if (!data || data.type !== "tir_test_login" || data.providerId !== provider.value.id) return;
  if (data.error) {
    loginTest.value = { loading: false, error: data.error };
  } else {
    loginTest.value = {
      loading: false,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      groups: data.groups,
      userRoleId: data.userRoleId,
      denied: data.denied,
    };
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
