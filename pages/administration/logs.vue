<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-lg bg-white dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-7xl pt-4 lg:flex lg:gap-x-16 lg:px-8">
          <aside
            class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20"
          >
            <nav class="flex-none px-4 sm:px-6 lg:px-0">
              <ul role="list" class="flex gap-x-2 gap-y-1 whitespace-nowrap lg:flex-col">
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
          <!------------------------------------------------------------------------------------------------------->
          <main class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
            <div
              aria-live="assertive"
              class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-24"
            >
              <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
                <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
                <transition
                  enter-active-class="transform ease-out duration-300 transition"
                  enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                  enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                  leave-active-class="transition ease-in duration-100"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div
                    v-if="changeSuccessful"
                    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-red-50 shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div class="p-4">
                      <div class="flex items-start">
                        <div class="flex-shrink-0">
                          <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                          <p class="text-sm font-medium text-gray-900">Successfully saved!</p>
                        </div>
                        <div class="ml-4 flex flex-shrink-0">
                          <button
                            type="button"
                            class="inline-flex rounded-md bg-green-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <span class="sr-only">Close</span>
                            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
              <div>
                <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">Log Configuration</h2>
                <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-200">
                  Edit parameters below:<br /><br />
                </p>

                <form
                  class="flex h-full flex-col divide-y divide-gray-400 bg-white dark:divide-gray-200 dark:bg-gray-800"
                  @submit.prevent="submitLogConfig()"
                >
                  <div
                    class="space-y-6 divide-y divide-gray-400 border-t border-gray-400 text-sm leading-6 dark:divide-gray-100 dark:border-gray-200"
                  >
                    <!-- Console Section -->
                    <div class="pt-6 sm:flex">
                      <div
                        class="pl-10 text-base font-semibold leading-7 text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6"
                      >
                        Console
                      </div>
                      <div class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
                        <!-- Log Level -->
                        <div class="flex items-center justify-between">
                          <span class="mr-4 whitespace-nowrap pl-12 text-gray-800 dark:text-white">Log Level</span>
                          <select
                            id="consoleLogLevels"
                            v-model="logConfig.consoleLogLevel"
                            class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            name="consoleLogLevels"
                            style="max-width: 8rem"
                          >
                            <option v-for="levels in Object.keys(loglvl.data.value)" :key="levels">
                              {{ levels }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div
                      class="space-y-6 divide-y divide-gray-400 border-t border-gray-400 text-sm leading-6 dark:divide-gray-100 dark:border-gray-200"
                    >
                      <!-- File Section -->
                      <div class="pt-6 sm:flex">
                        <div
                          class="pl-10 text-base font-semibold leading-7 text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6"
                        >
                          File
                        </div>
                        <div class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
                          <!-- Enable Switch -->
                          <div class="flex items-center justify-end">
                            <span class="mr-4 text-gray-800 dark:text-white">Enabled</span>
                            <Switch
                              v-model="logConfig.fileLogEnabled"
                              :class="[
                                logConfig.fileLogEnabled ? 'bg-indigo-600' : 'bg-gray-200',
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                              ]"
                            >
                              <span class="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                :class="[
                                  logConfig.fileLogEnabled ? 'translate-x-5' : 'translate-x-0',
                                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                ]"
                              />
                            </Switch>
                          </div>
                          <!-- Log Level Dropdown -->
                          <div class="flex items-center justify-between">
                            <span class="mr-4 whitespace-nowrap pl-12 text-gray-800 dark:text-white">Log Level</span>
                            <select
                              id="fileLogLevels"
                              v-model="logConfig.fileLogLevel"
                              class="block w-24 w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              name="fileLogLevels"
                              style="max-width: 8rem"
                            >
                              <option v-for="level in Object.keys(loglvl.data.value)" :key="level">
                                {{ level }}
                              </option>
                            </select>
                          </div>
                          <!-- Path Textbox -->
                          <div class="flex items-center justify-between">
                            <span class="w-32 pl-12 text-gray-800 dark:text-white">Path</span>
                            <input
                              v-model="logConfig.logPath"
                              type="text"
                              class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="Enter file path"
                              name="filePath"
                              style="max-width: 12rem"
                            />
                          </div>
                          <!-- Max File Size Textbox -->
                          <div class="flex items-center justify-between">
                            <span class="w-32 whitespace-nowrap pl-12 text-gray-800 dark:text-white"
                              >Max File Size (MB)</span
                            >
                            <input
                              v-model="logConfig.maxSize"
                              type="number"
                              class="pr-2text-gray-900 block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="Max Log File Size"
                              name="maxSize"
                              style="max-width: 8rem"
                            />
                          </div>
                          <!-- Max Days Textbox -->
                          <div class="flex items-center justify-between">
                            <span class="w-32 whitespace-nowrap pl-12 text-gray-800 dark:text-white"
                              >Days to Retain</span
                            >
                            <input
                              v-model="logConfig.maxDays"
                              type="number"
                              class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="Enter maximum days"
                              name="maxDays"
                              style="max-width: 8rem"
                            />
                          </div>
                          <!-- Zip Archive -->
                          <div class="flex items-center justify-between">
                            <span class="mr-4 whitespace-nowrap pl-12 text-gray-800 dark:text-white">Zip Archive</span>
                            <Switch
                              v-model="logConfig.zipArchive"
                              class="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                            >
                              <span class="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                class="pointer-events-none absolute h-full w-full rounded-md bg-white"
                              />
                              <span
                                aria-hidden="true"
                                :class="[
                                  logConfig.zipArchive ? 'bg-indigo-600' : 'bg-gray-200',
                                  'pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out',
                                ]"
                              />
                              <span
                                aria-hidden="true"
                                :class="[
                                  logConfig.zipArchive ? 'translate-x-5' : 'translate-x-0',
                                  'pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
                                ]"
                              />
                            </Switch>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Syslog Section -->
                    <div class="pt-6 sm:flex">
                      <div
                        class="pl-10 text-base font-semibold leading-7 text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6"
                      >
                        Syslog
                      </div>
                      <div class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
                        <!-- Syslog Enable -->
                        <div class="flex items-center justify-end">
                          <span class="mr-4 text-gray-800 dark:text-white">Enabled</span>
                          <Switch
                            v-model="logConfig.syslogLogEnabled"
                            :class="[
                              logConfig.syslogLogEnabled ? 'bg-indigo-600' : 'bg-gray-200',
                              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                            ]"
                          >
                            <span class="sr-only">Use setting</span>
                            <span
                              aria-hidden="true"
                              :class="[
                                logConfig.syslogLogEnabled ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                              ]"
                            />
                          </Switch>
                        </div>
                        <!-- Log Level Dropdown -->
                        <div class="flex items-center justify-between">
                          <span class="mr-4 whitespace-nowrap pl-12 text-gray-800 dark:text-white">Log Level</span>
                          <select
                            id="syslogLogLevel"
                            v-model="logConfig.syslogLogLevel"
                            class="block w-24 w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            name="syslogLogLevel"
                            style="max-width: 8rem"
                          >
                            <option v-for="level in Object.keys(loglvl.data.value)" :key="level">
                              {{ level }}
                            </option>
                          </select>
                        </div>
                        <!-- Syslog Target Textbox -->
                        <div class="flex items-center justify-between">
                          <span class="w-32 whitespace-nowrap pl-12 text-gray-800 dark:text-white">Syslog Target</span>
                          <input
                            v-model="logConfig.syslogTarget"
                            type="text"
                            class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Enter syslog target address"
                            name="syslogTarget"
                            style="max-width: 12rem"
                          />
                        </div>
                        <!-- Syslog Port Textbox -->
                        <div class="flex items-center justify-between">
                          <span class="w-32 pl-12 text-gray-800 dark:text-white">Syslog Port</span>
                          <input
                            v-model="logConfig.syslogPort"
                            type="number"
                            class="pr-2text-gray-900 block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Syslog Port"
                            name="syslogPort"
                            style="max-width: 8rem"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-shrink-0 justify-end px-4 py-4 pr-10">
                      <button
                        type="submit"
                        class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 pl-8 pr-8 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :error="errorObject"
      @show="showErrorNotification = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Switch } from "@headlessui/vue";
import {
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();

onBeforeMount(() => {
  store.changeUsername("Administration");
});
const showErrorNotification = ref(false);
const errorObject = ref();
const router = useRouter();
const { data: logConfig } = await useFetch("/api/config/logConfig", { method: "GET", key: "logConfigApi" });
const loglvl = await useFetch("/api/config/logLevels", { method: "GET" });
const changeSuccessful = ref(false);
const secondaryNavigation = [
  { name: "General", href: "/administration/general", icon: UserCircleIcon, current: false },
  { name: "Configuration", href: "/administration/configuration", icon: WrenchIcon, current: false },
  { name: "Notifications", href: "#", icon: BellIcon, current: false },
  { name: "Users", href: "/administration/team-members", icon: UsersIcon, current: false },
  { name: "Logs", href: "/administration/logs", icon: DocumentDuplicateIcon, current: true },
];

async function submitLogConfig() {
  try {
    await $fetch("/api/config/logConfig", {
      method: "PUT",
      body: logConfig.value,
    });
    changeSuccessful.value = true;
    setTimeout(hideNotification, 3000);
  } catch (err) {
    changeSuccessful.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    if (changeSuccessful.value === true) {
      refreshNuxtData("logConfigApi");
    }
  }
}

function hideNotification() {
  changeSuccessful.value = false;
}
</script>
