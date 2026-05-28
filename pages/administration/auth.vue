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
    <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Local Auth</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Built-in username/password authentication.</p>
      </div>
      <div
        v-if="authConfig"
        class="flex-1 space-y-4 text-gray-800 dark:text-white"
      >
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch
            v-model="authConfig.local.enable"
            class="ml-auto"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Min Length</label>
          <input
            v-model.number="authConfig.local.passwordLength"
            type="number"
            min="1"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Uppercase Letters</label>
          <input
            v-model.number="authConfig.local.upperCount"
            type="number"
            min="0"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Lowercase Letters</label>
          <input
            v-model.number="authConfig.local.lowerCount"
            type="number"
            min="0"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Numbers</label>
          <input
            v-model.number="authConfig.local.numberCount"
            type="number"
            min="0"
            class="input-field"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-48 text-left text-sm font-medium">Special Characters</label>
          <input
            v-model.number="authConfig.local.specialCount"
            type="number"
            min="0"
            class="input-field"
          />
        </div>
      </div>
    </dd>

    <!-- Dynamic provider sections -->
    <template v-if="authConfig">
      <!-- LDAP providers -->
      <dd
        v-for="(provider, idx) in authConfig.ldap"
        :key="provider.id"
        class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto"
      >
        <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
          <div class="text-lg font-medium">{{ provider.label }}</div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">LDAP</p>
          <button
            type="button"
            class="mt-2 text-xs text-red-500 hover:text-red-700"
            @click="removeLDAP(idx)"
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
              v-model="providerSecrets[provider.id]"
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

          <!-- Test buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              :disabled="ldapTests[provider.id]?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="testLDAPConnection(provider)"
            >
              {{ ldapTests[provider.id]?.loading ? "Testing…" : "Test Connection" }}
            </button>
            <button
              type="button"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="toggleLDAPLoginForm(provider.id)"
            >
              Test Login
            </button>
          </div>

          <!-- Test login form -->
          <div
            v-if="ldapLoginForms[provider.id]?.visible"
            class="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <label class="w-24 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">Username</label>
              <input
                v-model="ldapLoginForms[provider.id].username"
                type="text"
                placeholder="jsmith"
                class="input-field text-xs"
                @keyup.enter="testLDAPLogin(provider)"
              />
            </div>
            <div class="flex items-center gap-3">
              <label class="w-24 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
              <input
                v-model="ldapLoginForms[provider.id].testPassword"
                type="password"
                placeholder="User's password"
                class="input-field text-xs"
                @keyup.enter="testLDAPLogin(provider)"
              />
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                :disabled="loginTests[provider.id]?.loading"
                class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="testLDAPLogin(provider)"
              >
                {{ loginTests[provider.id]?.loading ? "Testing…" : "Run Test" }}
              </button>
            </div>
          </div>

          <!-- Connection test results -->
          <AuthConnectionTestResult :result="ldapTests[provider.id]" />

          <!-- Login test results -->
          <AuthLoginTestResult
            v-if="loginTests[provider.id] && !loginTests[provider.id].loading"
            :result="loginTests[provider.id]"
          />
        </div>
      </dd>

      <!-- OIDC providers -->
      <dd
        v-for="(provider, idx) in authConfig.oidc"
        :key="provider.id"
        class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto"
      >
        <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
          <div class="text-lg font-medium">{{ provider.label }}</div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">OpenID Connect</p>
          <button
            type="button"
            class="mt-2 text-xs text-red-500 hover:text-red-700"
            @click="removeOIDC(idx)"
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
              v-model="providerSecrets[provider.id]"
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

          <!-- Test buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              :disabled="oidcTests[provider.id]?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="testOIDCConnection(provider)"
            >
              {{ oidcTests[provider.id]?.loading ? "Testing…" : "Test Connection" }}
            </button>
            <button
              type="button"
              :disabled="loginTests[provider.id]?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Requires saved config — opens a popup to run the full OIDC login flow without affecting your current session"
              @click="testOIDCLogin(provider.id)"
            >
              {{ loginTests[provider.id]?.loading ? "Waiting…" : "Test Login" }}
            </button>
          </div>

          <!-- Connection test results -->
          <AuthConnectionTestResult :result="oidcTests[provider.id]" />

          <!-- Login test results -->
          <AuthLoginTestResult
            v-if="loginTests[provider.id] && !loginTests[provider.id].loading"
            :result="loginTests[provider.id]"
          />
        </div>
      </dd>
      <!-- OAuth providers -->
      <dd
        v-for="(provider, idx) in authConfig.oauth"
        :key="provider.id"
        class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto"
      >
        <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
          <div class="text-lg font-medium">{{ provider.label }}</div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">OAuth 2.0</p>
          <button
            type="button"
            class="mt-2 text-xs text-red-500 hover:text-red-700"
            @click="removeOAuth(idx)"
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
          <!-- GitLab optional selfhosted base URL -->
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
          <!-- Custom. all endpoints configurable -->
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
              v-model="providerSecrets[provider.id]"
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
                :placeholder="oauthMappingPlaceholder(provider.providerType)"
                class="input-field"
              />
              <p class="text-xs text-gray-400">
                {{ oauthMappingHint(provider.providerType) }}
                Leave empty to grant all authenticated users the User role.
              </p>
            </div>
          </div>
          <!-- Custom group claim path -->
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

          <!-- Test buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              :disabled="oauthTests[provider.id]?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="testOAuthConnection(provider)"
            >
              {{ oauthTests[provider.id]?.loading ? "Testing…" : "Test Connection" }}
            </button>
            <button
              type="button"
              :disabled="loginTests[provider.id]?.loading"
              class="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Requires saved config — opens a popup to run the full OAuth login flow without affecting your current session"
              @click="testOAuthLogin(provider.id)"
            >
              {{ loginTests[provider.id]?.loading ? "Waiting…" : "Test Login" }}
            </button>
          </div>

          <!-- Connection test results -->
          <AuthConnectionTestResult :result="oauthTests[provider.id]" />

          <!-- Login test results -->
          <AuthLoginTestResult
            v-if="loginTests[provider.id] && !loginTests[provider.id].loading"
            :result="loginTests[provider.id]"
          />
        </div>
      </dd>
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
import type {
  AuthConfig,
  LDAPProviderConfig,
  OIDCProviderConfig,
  OAuthProviderConfig,
  LoginTestResult,
  ConnectionTestResult,
} from "~/types/auth";

definePageMeta({ layout: "admin" });

const authConfig = ref<AuthConfig>();
const providerSecrets = ref<Record<string, string>>({});
const showProviderMenu = ref(false);

type TestResult = ConnectionTestResult;

interface LDAPLoginForm {
  visible: boolean;
  username: string;
  testPassword: string;
}

const ldapTests = ref<Record<string, TestResult>>({});
const oidcTests = ref<Record<string, TestResult>>({});
const oauthTests = ref<Record<string, TestResult>>({});
const loginTests = ref<Record<string, LoginTestResult>>({});
const ldapLoginForms = ref<Record<string, LDAPLoginForm>>({});

onMounted(async () => {
  authConfig.value = await $fetch<AuthConfig>("/api/config/authLoad");
});

onMounted(() => {
  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".relative")) {
      showProviderMenu.value = false;
    }
  });

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.type !== "tir_test_login" || !data.providerId) return;
    const id = data.providerId as string;
    if (data.error) {
      loginTests.value[id] = { loading: false, error: data.error };
    } else {
      loginTests.value[id] = {
        loading: false,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        groups: data.groups,
        userRoleId: data.userRoleId,
        denied: data.denied,
      };
    }
  });
});

function nextId(prefix: string, existing: string[]): string {
  let i = 1;
  while (existing.includes(`${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
}

function addLDAP() {
  if (!authConfig.value) return;
  showProviderMenu.value = false;
  const existingIds = authConfig.value.ldap.map((p) => p.id);
  const id = nextId("ldap", existingIds);
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
  const existingIds = authConfig.value.oidc.map((p) => p.id);
  const id = nextId("oidc", existingIds);
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
  const existingIds = authConfig.value.oauth.map((p) => p.id);
  const id = nextId("oauth", existingIds);
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

function callbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/auth/callback`;
}

function oauthMappingPlaceholder(providerType: string): string {
  const map: Record<string, string> = {
    github: "myorg/teamslug:1,myorg/devs:2",
    gitlab: "my-group:1,parent/child-group:2",
    bitbucket: "my-workspace:1",
    custom: "admin:1,developers:2",
  };
  return map[providerType] ?? "group:roleId";
}

async function testLDAPConnection(provider: LDAPProviderConfig) {
  ldapTests.value[provider.id] = { loading: true };
  try {
    const result = await $fetch<{ ok: boolean; checks: TestResult["checks"] }>("/api/auth/test/ldap", {
      method: "POST",
      body: {
        id: provider.id,
        url: provider.url,
        bindDn: provider.bindDn,
        password: providerSecrets.value[provider.id] || undefined,
        baseDn: provider.baseDn,
        ssl: provider.ssl,
        sslInsecure: provider.sslInsecure,
        sslCa: provider.sslCa,
      },
    });
    ldapTests.value[provider.id] = { loading: false, checks: result.checks };
  } catch (err: any) {
    ldapTests.value[provider.id] = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

function toggleLDAPLoginForm(providerId: string) {
  if (!ldapLoginForms.value[providerId]) {
    ldapLoginForms.value[providerId] = { visible: true, username: "", testPassword: "" };
  } else {
    ldapLoginForms.value[providerId].visible = !ldapLoginForms.value[providerId].visible;
  }
}

async function testLDAPLogin(provider: LDAPProviderConfig) {
  const form = ldapLoginForms.value[provider.id];
  if (!form?.username || !form?.testPassword) return;
  loginTests.value[provider.id] = { loading: true };
  try {
    const result = await $fetch<Omit<LoginTestResult, "loading"> & { ok: boolean }>("/api/auth/test/ldap-login", {
      method: "POST",
      body: {
        id: provider.id,
        url: provider.url,
        bindDn: provider.bindDn,
        password: providerSecrets.value[provider.id] || undefined,
        baseDn: provider.baseDn,
        ssl: provider.ssl,
        sslInsecure: provider.sslInsecure,
        sslCa: provider.sslCa,
        template: provider.template,
        groupAttribute: provider.groupAttribute,
        groupMappings: provider.groupMappings,
        username: form.username,
        testPassword: form.testPassword,
      },
    });
    loginTests.value[provider.id] = { loading: false, ...result };
  } catch (err: any) {
    loginTests.value[provider.id] = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

async function testOIDCConnection(provider: OIDCProviderConfig) {
  oidcTests.value[provider.id] = { loading: true };
  try {
    const result = await $fetch<{ ok: boolean; checks: TestResult["checks"] }>("/api/auth/test/oidc", {
      method: "POST",
      body: {
        id: provider.id,
        url: provider.url,
        clientId: provider.clientId,
        secret: providerSecrets.value[provider.id] || undefined,
        callback: provider.callback,
        sslInsecure: provider.sslInsecure,
      },
    });
    oidcTests.value[provider.id] = { loading: false, checks: result.checks };
  } catch (err: any) {
    oidcTests.value[provider.id] = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

function testOIDCLogin(providerId: string) {
  loginTests.value[providerId] = { loading: true };
  window.open(
    `/api/auth/login/oidc?provider=${encodeURIComponent(providerId)}&test=true`,
    "tir_test_login",
    "width=600,height=700",
  );
}

async function testOAuthConnection(provider: OAuthProviderConfig) {
  oauthTests.value[provider.id] = { loading: true };
  try {
    const result = await $fetch<{ ok: boolean; checks: TestResult["checks"] }>("/api/auth/test/oauth", {
      method: "POST",
      body: {
        providerType: provider.providerType,
        baseUrl: provider.baseUrl,
        authorizationUrl: provider.authorizationUrl,
        tokenUrl: provider.tokenUrl,
        userInfoUrl: provider.userInfoUrl,
      },
    });
    oauthTests.value[provider.id] = { loading: false, checks: result.checks };
  } catch (err: any) {
    oauthTests.value[provider.id] = { loading: false, error: err?.data?.message ?? err.message ?? "Test failed" };
  }
}

function testOAuthLogin(providerId: string) {
  loginTests.value[providerId] = { loading: true };
  window.open(
    `/api/auth/login/oauth?provider=${encodeURIComponent(providerId)}&test=true`,
    "tir_test_login",
    "width=600,height=700",
  );
}

function oauthMappingHint(providerType: string): string {
  const map: Record<string, string> = {
    github: "Format: org/teamslug:roleId —",
    gitlab: "Format: group-path:roleId (nested groups: parent/child:roleId) —",
    bitbucket: "Format: workspace-slug:roleId —",
    custom: "Format: groupname:roleId —",
  };
  return map[providerType] ?? "Format: identifier:roleId —";
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

<style scoped lang="postcss">
.input-field {
  @apply flex-1 rounded border px-2 py-1 text-sm
    placeholder-gray-400
    dark:bg-gray-800 dark:text-white
    dark:placeholder-gray-500;
}
</style>
