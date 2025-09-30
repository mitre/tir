<template>
  <div>
    <div class="space-y-16 pr-6 sm:space-y-20">
      <div>
        <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">App Configuration</h2>
        <p class="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-200">Edit parameters below:</p>

        <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <!-- Terminology Section -->
          <div class="pt-6 sm:flex">
            <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Terminology</dt>
            <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div class="text-gray-800 dark:text-white">
                <table class="min-w-full">
                  <thead>
                    <tr>
                      <th class="px-4 py-2">Term</th>
                      <th class="px-4 py-2">Alias</th>
                    </tr>
                  </thead>
                  <tbody v-if="alias.aliases && alias.aliases.length">
                    <tr v-for="(item, index) in alias.aliases" :key="index">
                      <td class="px-4 py-2 font-medium">{{ item.term }}</td>
                      <td class="px-4 py-2">
                        <!-- <input v-model="item.alias" type="text" class="w-full rounded border-indigo-400 px-3 py-1" />
                      </td> -->
                        <input
                          v-model="item.alias"
                          type="text"
                          class="w-full rounded border-indigo-400 bg-white px-3 py-1 text-gray-900 dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td colspan="2" class="text-sm text-gray-900 dark:text-white">Alias data not loaded.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="flex w-1/4 items-center justify-end">
                <ShieldCheckIcon
                  v-if="aliasUpdateGood"
                  :class="['m-2 h-6 w-6 font-light text-green-500', { 'animate-pulse': aliasUpdate }]"
                />
                <XCircleIcon
                  v-if="aliasUpdateError"
                  :class="['m-2 h-6 w-6 font-light text-red-500', { 'animate-pulse': aliasUpdate }]"
                />
                <button class="font-semibold text-indigo-600 hover:text-indigo-500" type="button" @click="saveAliases">
                  Save
                </button>
              </div>
            </dd>
          </div>

          <!-- Certificate Import Section -->
          <div class="pt-6 sm:flex">
            <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Certificate Import</dt>
            <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div class="text-gray-800 dark:text-white">
                <!-- CA Cert -->
                <div class="mb-3">
                  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">CA Certificate</label>
                  <div class="flex items-center">
                    <input
                      ref="CaCert"
                      type="file"
                      accept=".crt"
                      class="rounded-md border pr-2 text-xs file:mr-2 file:rounded-l-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-xs file:font-medium file:text-black hover:file:cursor-pointer hover:file:bg-gray-100 hover:file:text-indigo-700 dark:file:bg-white dark:hover:file:bg-gray-100"
                      :class="{ 'border-red-500': caError, 'border-indigo-400': !caError }"
                    />
                    <ExclamationCircleIcon v-if="caError" class="ml-2 h-6 w-6 animate-bounce text-red-500" />
                  </div>
                </div>

                <!-- Site Cert -->
                <div class="mb-3">
                  <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white">Site Certificate</label>
                  <div class="flex items-center">
                    <input
                      ref="siteCert"
                      type="file"
                      accept=".key"
                      class="rounded-md border pr-2 text-xs file:mr-2 file:rounded-l-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-xs file:font-medium file:text-black hover:file:cursor-pointer hover:file:bg-gray-100 hover:file:text-indigo-700 dark:file:bg-white dark:hover:file:bg-gray-100"
                      :class="{ 'border-red-500': siteError, 'border-indigo-400': !siteError }"
                    />
                    <ExclamationCircleIcon v-if="siteError" class="ml-2 h-6 w-6 animate-bounce text-red-500" />
                  </div>
                </div>

                <!-- Success Indicator -->
                <div v-if="certImportSuccess" class="flex animate-pulse items-center text-green-500">
                  <ShieldCheckIcon class="m-2 h-6 w-6" />
                  <span>Certificate Import Successful!</span>
                </div>
              </div>

              <!-- Import Button -->
              <div class="flex w-1/4 items-center justify-end">
                <button class="font-semibold text-indigo-600 hover:text-indigo-500" type="button" @click="verifyImport">
                  Import
                </button>
              </div>
            </dd>
          </div>

          <!-- Notifications Configuration Section -->
          <div class="pt-6 sm:flex">
            <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Notifications</dt>
            <dd class="mt-1 flex justify-between sm:mt-0 sm:flex-auto">
              <div class="flex flex-col space-y-2 text-gray-800 dark:text-white">
                <label for="notification-timeout" class="text-sm font-medium"> Notification Timeout (ms) </label>
                <input
                  id="notification-timeout"
                  v-model="notificationTimeout"
                  type="number"
                  min="1000"
                  step="500"
                  placeholder="3000"
                  class="block w-32 rounded border-indigo-400 px-2 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div class="flex w-1/4 items-center justify-end">
                <button
                  class="font-semibold text-indigo-600 hover:text-indigo-500"
                  type="button"
                  @click="saveNotificationTimeout"
                >
                  Save
                </button>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>

  <!-- Modal Spinner -->
  <TransitionRoot as="template" :show="loading">
    <Dialog as="div" class="relative z-10" @close="loading = false">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
          >
            <div class="flex h-7 items-center justify-end">
              <button
                type="button"
                class="rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-indigo-200"
                @click="loading = false"
              >
                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div class="text-center">
              <DialogTitle class="text-base font-semibold leading-6 text-gray-800 dark:text-white">
                Checking Certificates
              </DialogTitle>
              <p class="mt-2 text-sm text-gray-800 dark:text-white">Please Wait...</p>
              <div class="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2">
                <svg
                  class="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                  viewBox="0 0 24 24"
                ></svg>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Error Notification -->
  <ErrorNotification
    v-if="showErrorNotification"
    :show="showErrorNotification"
    :error="errorObject"
    @show="showErrorNotification = false"
  />
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from "@headlessui/vue";
import { ShieldCheckIcon, ExclamationCircleIcon, XMarkIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import { useNotificationStore } from "~/stores/NotificationStore";

const notificationStore = useNotificationStore();

const alias = useAliasStore();
const CaCert = ref<HTMLInputElement | null>(null);
const siteCert = ref<HTMLInputElement | null>(null);
const siteError = ref(false);
const caError = ref(false);
const showErrorNotification = ref(false);
const errorObject = ref();
const loading = ref(false);
const certImportSuccess = ref(false);
const aliasUpdateGood = ref(false);
const aliasUpdateError = ref(false);
const aliasUpdate = ref(false);
const notificationTimeout = ref<number>(3000);

definePageMeta({
  layout: "admin",
});

onBeforeMount(async () => {
  await alias.loadAliases();

  try {
    const data = await $fetch<{ timeout: number }>("/api/config/notificationTimeout");
    if (data?.timeout) {
      notificationTimeout.value = data.timeout;
    }
  } catch (error) {
    console.error("Failed to load notification timeout", error);
  }
});

async function saveAliases() {
  const aliasMap: Record<string, string> = alias.aliases.reduce((map, aliasEntry) => {
    map[aliasEntry.term] = aliasEntry.alias;
    return map;
  }, {});
  try {
    await $fetch("/api/config/alias", { method: "PUT", body: aliasMap });
    aliasUpdateGood.value = true;
  } catch {
    aliasUpdateError.value = true;
  } finally {
    aliasUpdate.value = true;
  }
  watch(
    aliasUpdate,
    (newValue) => {
      if (newValue) {
        setTimeout(() => (aliasUpdate.value = false), 3000);
        setTimeout(() => {
          aliasUpdateGood.value = false;
          aliasUpdateError.value = false;
        }, 6000);
      }
    },
    { immediate: true },
  );
  await alias.loadAliases();
}

async function saveNotificationTimeout() {
  try {
    await notificationStore.setTimeout(notificationTimeout.value);

    console.log("Calling addNotification");
    notificationStore.addNotification({
      type: "success",
      message: "Timeout value saved!",
    });
  } catch (err) {
    notificationStore.addNotification({
      type: "error",
      message: "Failed to save timeout setting.",
    });
    console.error(err);
  }
}

function verifyImport() {
  if (!CaCert.value?.value) {
    caError.value = true;
    setTimeout(() => (caError.value = false), 3000);
  }
  if (!siteCert.value?.value) {
    siteError.value = true;
    setTimeout(() => (siteError.value = false), 3000);
  }
  if (siteCert.value?.value && CaCert.value?.value) {
    importCert();
  }
}

async function importCert() {
  if (siteCert.value?.files?.length && CaCert.value?.files?.length) {
    loading.value = true;
    const formData = new FormData();
    formData.append("caCert", CaCert.value.files[0]);
    formData.append("siteCert", siteCert.value.files[0]);
    try {
      await $fetch("/api/import/cert", { method: "POST", body: formData });
      setTimeout(siteStatus, 5000);
    } catch (err) {
      loading.value = false;
      errorObject.value = err;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  }
}

async function siteStatus() {
  let siteResponse = false;
  while (!siteResponse) {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      if (data.status === "OK") {
        siteResponse = true;
        loading.value = false;
        certImportSuccess.value = true;
        setTimeout(() => (certImportSuccess.value = false), 4000);
        location.reload();
      }
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
</script>
