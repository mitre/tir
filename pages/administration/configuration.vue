<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-lg bg-white dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-7xl pt-4 lg:flex lg:gap-x-16 lg:px-8">
          <aside
            class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20"
          >
            <nav class="flex-none px-4 sm:px-6 lg:px-0">
              <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
                <li v-for="item in secondaryNavigation" :key="item.name">
                  <a
                    :class="[
                      item.current
                        ? 'bg-gray-100 text-indigo-600 dark:bg-gray-50'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-50 dark:hover:text-indigo-600',
                      'group flex cursor-pointer gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6',
                    ]"
                    @click="router.push(item.href)"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        item.current
                          ? 'text-indigo-600'
                          : 'text-gray-500 group-hover:text-indigo-600 dark:text-gray-100',
                        'h-6 w-6 shrink-0',
                      ]"
                      aria-hidden="true"
                    />
                    {{ item.name }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <main class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
            <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
              <div>
                <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">App Configuration</h2>
                <p class="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-200">Edit parameters below:</p>

                <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div class="pt-6 sm:flex">
                    <dt class="font-small text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Terminology</dt>

                    <!-- creating tern -->

                    <form>
                      <div class="col-span-full">
                        <table>
                          <thead>
                            <tr>
                              <th class="px-6 py-6 text-sm font-medium text-black dark:text-white">Default</th>
                              <th class="px-6 py-6 text-sm font-medium text-black dark:text-white">Current</th>
                              <th class="px-6 py-6 text-sm font-medium text-black dark:text-white">New Term</th>
                            </tr>
                          </thead>
                          <tr>
                            <td class="px-6 py-6 text-sm font-medium text-black dark:text-white">
                              {{ inflection.pluralize(tierView.term) }}
                            </td>
                            <td class="px-6 py-6 text-sm font-medium text-black dark:text-white">
                              {{ inflection.pluralize(tierView.alias) }}
                            </td>
                            <td>
                              <input
                                v-model="newAlias"
                                name="new_term"
                                autocomplete="new-term"
                                class="block w-full rounded-md border-0 bg-black/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td class="px-6 py-6 text-sm font-medium text-black dark:text-white">
                              {{ inflection.pluralize(boundaryView.term) }}
                            </td>
                            <td class="px-6 py-6 text-sm font-medium text-black dark:text-white">
                              {{ inflection.pluralize(boundaryView.alias) }}
                            </td>
                            <td>
                              <input
                                v-model="confirmnewAlias"
                                name="confirm_term"
                                autocomplete="new-term"
                                class="block w-full rounded-md border-0 bg-black/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
                              />
                            </td>
                          </tr>
                        </table>
                        <br />
                      </div>

                      <div class="mt-8 flex">
                        <button
                          class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          @click="[editAlias()]"
                        >
                          Update
                        </button>
                        <transition
                          enter-active-class="transform ease-out duration-300 transition"
                          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                          leave-active-class="transition ease-in duration-300"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <div v-if="matchError" class="animate-fade ml-4 pt-2 text-sm text-red-500">
                            <ExclamationTriangleIcon class="inline-block h-5 w-5" aria-hidden="true" /> Terms do not
                            match!
                          </div>
                        </transition>
                        <transition
                          enter-active-class="transform ease-out duration-300 transition"
                          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                          leave-active-class="transition ease-in duration-300"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <div v-if="changeSuccessful" class="animate-fade ml-4 pt-2 text-sm text-green-500">
                            <ShieldCheckIcon class="inline-block h-5 w-5" aria-hidden="true" /> Terminology has been set
                            successfully!
                          </div>
                        </transition>
                      </div>
                    </form>
                  </div>

                  <div class="pt-6 sm:flex">
                    <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">
                      Certificate Import
                    </dt>
                    <dd class="mt-1 flex justify-between sm:mt-0 sm:flex-auto">
                      <div class="text-gray-800 dark:text-white">
                        <div class="mb-3">
                          <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white" for="site_input"
                            >CA Certificate</label
                          >
                          <div class="flex items-center">
                            <input
                              id="site_input"
                              ref="CaCert"
                              type="file"
                              accept=".crt"
                              :class="[
                                caError ? 'border-red-500' : 'border-indigo-400',
                                'rounded-md border  pr-2 text-xs file:mr-2 file:rounded-l-md file:border-[0px] file:bg-gray-200 file:px-3 file:py-2 file:text-xs file:font-medium file:text-black hover:file:cursor-pointer hover:file:bg-gray-100 hover:file:text-indigo-700 dark:text-white dark:file:bg-white dark:hover:file:bg-gray-100',
                              ]"
                            />
                            <ExclamationCircleIcon
                              v-if="caError"
                              class="ml-2 h-6 w-6 animate-bounce font-light text-red-500"
                            />
                          </div>
                        </div>
                        <div class="mb-3">
                          <label class="mb-1 block text-sm font-medium text-gray-900 dark:text-white" for="site_input"
                            >Site Certificate</label
                          >
                          <div class="flex items-center">
                            <input
                              id="site_input"
                              ref="siteCert"
                              type="file"
                              accept=".key"
                              :class="[
                                siteError ? 'border-red-500' : 'border-indigo-400',
                                'rounded-md border  pr-2 text-xs file:mr-2 file:rounded-l-md file:border-[0px] file:bg-gray-200 file:px-3 file:py-2 file:text-xs file:font-medium file:text-black hover:file:cursor-pointer hover:file:bg-gray-100 hover:file:text-indigo-700 dark:text-white dark:file:bg-white dark:hover:file:bg-gray-100',
                              ]"
                            />
                            <ExclamationCircleIcon
                              v-if="siteError"
                              class="ml-2 h-6 w-6 animate-bounce font-light text-red-500"
                            />
                          </div>
                        </div>
                        <div v-if="certImportSuccess" class="flex animate-pulse items-center text-green-500">
                          <ShieldCheckIcon class="m-2 h-6 w-6 font-light" />
                          <span> Certificate Import Successful! </span>
                        </div>
                      </div>
                      <button
                        @click="verifyImport()"
                        type="button"
                        class="font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        Import
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :msg="errorMsg"
      @show="showErrorNotification = false"
    />
    <TransitionRoot as="template" :show="loading">
      <Dialog as="div" class="relative z-10" @close="loading = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
              >
                <div>
                  <div class="flex h-7 items-center">
                    <button
                      type="button"
                      class="rounded-md bg-gray-100 text-black hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-900 dark:text-indigo-200"
                      @click="loading = false"
                    >
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div class="text-center">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white">
                      Checking Certificates
                    </DialogTitle>
                    <div class="mb-12 mt-2">
                      <p class="text-sm text-gray-800 dark:text-white">Please Wait...</p>
                    </div>
                    <div class="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2">
                      <svg
                        class="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                        viewBox="0 0 24 24"
                      ></svg>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import {
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import inflection from "inflection";
import { useTestStore } from "~~/stores/HeaderValues";
onBeforeMount(() => {
  store.changeUsername("Administration");
});

const router = useRouter();
const store = useTestStore();
const CaCert = ref<HTMLInputElement | null>(null);
const siteCert = ref<HTMLInputElement | null>(null);
const siteError = ref(false);
const caError = ref(false);
const showErrorNotification = ref(false);
const errorMsg = ref();
const loading = ref(false);
const certImportSuccess = ref(false);
const termEdit = ref(false);
const confirmnewAlias = ref("");
const newAlias = ref("");
var matchError = ref(false);
var changeSuccessful = ref(false);

//for the term alias
const { data: currentAlias } = await useFetch("/api/boundaries/alias");
//renders the current alias
const tierView = ref(currentAlias.value && currentAlias.value[0]);
const boundaryView = ref(currentAlias.value && currentAlias.value[1]);

//button for alias to be updated
async function editAlias() {
  try {
    const { error } = await useFetch("/api/boundaries/alias", {
      method: "PUT",
      body: {
        Tier: newAlias,
        Boundary: confirmnewAlias,
      },
    });
    if (error.value != null) {
      console.log("Alias dose not exists");
    }
    setTimeout(() => location.reload(), 2000);
  } finally {
  }
}

const secondaryNavigation = [
  { name: "General", href: "/administration/general", icon: UserCircleIcon, current: false },
  { name: "Configuration", href: "/administration/configuration", icon: WrenchIcon, current: true },
  { name: "Notifications", href: "#", icon: BellIcon, current: false },
  { name: "Users", href: "/administration/team-members", icon: UsersIcon, current: false },
  { name: "Logs", href: "/administration/logs", icon: DocumentDuplicateIcon, current: false },
];

function verifyImport() {
  if (!CaCert.value?.value) {
    caError.value = true;
    setTimeout(() => {
      caError.value = false;
    }, 3000);
  }
  if (!siteCert.value?.value) {
    siteError.value = true;
    setTimeout(() => {
      siteError.value = false;
    }, 3000);
  }
  if (siteCert.value?.value && CaCert.value?.value) {
    importCert();
  }
}

async function importCert() {
  if (
    siteCert.value &&
    siteCert.value.files &&
    siteCert.value.files.length > 0 &&
    CaCert.value &&
    CaCert.value.files &&
    CaCert.value.files.length > 0
  ) {
    loading.value = true;
    const selectedCaFile = CaCert.value?.files[0];
    const selectedSiteFile = siteCert.value?.files[0];
    const formdata = new FormData();
    formdata.append("caCert", selectedCaFile);
    formdata.append("siteCert", selectedSiteFile);
    try {
      await $fetch("/api/import/cert", { method: "POST", body: formdata });
      setTimeout(() => siteStatus(), 5000);
    } catch (err) {
      loading.value = false;
      errorMsg.value = err.data.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = 5000): Promise<Response> {
  // Timeout function
  const abortController = new AbortController();
  const { signal } = abortController;
  const id = setTimeout(() => abortController.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    console.log(error);
  } finally {
    clearTimeout(id);
  }
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function siteStatus() {
  console.log("Checking Site Status");
  let siteResponse = false;
  while (!siteResponse) {
    try {
      const response = await fetchWithTimeout("/api/status", { method: "GET" }, 5000); // 10 second timeout
      const data = await response.json();
      if (data.status === "OK") {
        siteResponse = true;
        loading.value = false;
        certImportSuccess.value = true;
        setTimeout(() => {
          certImportSuccess.value = false;
        }, 4000);
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      await sleep(3000);
    }
  }

  location.reload();
}
</script>
