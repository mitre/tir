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
                    v-if="removeError"
                    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-red-50 shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div class="p-4">
                      <div class="flex items-start">
                        <div class="flex-shrink-0">
                          <XCircleIcon class="h-6 w-6 text-red-400" aria-hidden="true" />
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                          <p class="text-sm font-medium text-gray-900">There was an error with what you are saving</p>
                          <p class="mt-1 text-sm text-gray-500">{{ errorName }}</p>
                        </div>
                        <div class="ml-4 flex flex-shrink-0">
                          <button
                            type="button"
                            class="inline-flex rounded-md bg-red-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            @click="removeError = false"
                          >
                            <span class="sr-only">Close</span>
                            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
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
                            @click="removeError = false"
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
                <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-200">Edit parameters below:</p>

                <form
                  class="flex h-full flex-col divide-y divide-gray-400 bg-white dark:divide-gray-200 dark:bg-gray-800"
                  @submit.prevent="editLogs()"
                >
                  <dl
                    class="mt-6 space-y-6 divide-y divide-gray-400 border-t border-gray-400 text-sm leading-6 dark:divide-gray-100 dark:border-gray-200"
                  >
                    <div class="pt-6 sm:flex">
                      <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">PATH</dt>
                      <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                        <input v-model="LogPath" class="w-full rounded-lg" type="text" />
                      </dd>
                    </div>
                    <div class="pt-6 sm:flex">
                      <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">
                        Syslog Target
                      </dt>
                      <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                        <input v-model="SysLogTarget" class="rounded-lg" type="text" />
                      </dd>
                    </div>
                    <div class="pt-6 sm:flex">
                      <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Port</dt>
                      <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                        <input v-model="SysLogPort" class="rounded-lg" type="text" />
                      </dd>
                    </div>
                    <div class="pt-6 sm:flex">
                      <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Log Level</dt>
                      <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                        <div>
                          <select
                            id="LogLevels"
                            class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            v-model="LogLevel"
                            name="LogLevels"
                            @click="console.log(LogLevel)"
                          >
                            <option v-for="levels in Object.keys(loglvl.data.value)">
                              {{ levels }}
                            </option>
                          </select>
                        </div>
                      </dd>
                    </div>
                    <div class="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="submit"
                        class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        @click="[console.log(LogPath, SysLogTarget, SysLogPort, LogLevel)]"
                      >
                        Save
                      </button>
                    </div>
                  </dl>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();

onBeforeMount(() => {
  store.changeUsername("Administration");
});
const router = useRouter();
const { data } = await useFetch("/api/config/logConfig");
const loglvl = await useFetch("/api/config/logLevels", { method: "GET" });
const LogPath = ref(data.value.logPath);
const SysLogTarget = ref(data.value.syslogTarget);
const SysLogPort = ref(data.value.syslogPort);
const removeError = ref(false);
const changeSuccessful = ref(false);
const errorName = ref("");
const LogLevel = ref(Object.keys(loglvl.data.value)[loglvl.data.value[data.value.logLevel]]);

const secondaryNavigation = [
  { name: "General", href: "/administration/general", icon: UserCircleIcon, current: false },
  { name: "Configuration", href: "/administration/configuration", icon: WrenchIcon, current: false },
  { name: "Notifications", href: "#", icon: BellIcon, current: false },
  { name: "Users", href: "/administration/team-members", icon: UsersIcon, current: false },
  { name: "Logs", href: "/administration/logs", icon: DocumentDuplicateIcon, current: true },
];

async function editLogs() {
  const editData = {
    logPath: LogPath.value,
    syslogTarget: SysLogTarget.value,
    syslogPort: SysLogPort.value,
    logLevel: LogLevel.value,
  };

  try {
    const { error } = await useFetch("/api/config/logConfig", {
      method: "PUT",
      body: editData,
    });
    if (error.value != null) {
      changeSuccessful.value = false;
      errorName.value = error.value.statusMessage;
      removeError.value = true;
      setTimeout(hideNotification, 3000);
    } else {
      removeError.value = false;
      changeSuccessful.value = true;
      setTimeout(hideNotification, 3000);
    }
  } finally {
    if (changeSuccessful.value === true) {
      setTimeout(() => location.reload(), 4000);
    }
  }
}

function hideNotification() {
  changeSuccessful.value = false;
  removeError.value = false;
}
</script>
