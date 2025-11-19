<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl space-y-16 pr-8 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <div>
        <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">Log Configuration</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-200">Edit parameters below:</p>

        <form
          class="mt-6 flex flex-col space-y-8 divide-y divide-gray-300 text-sm dark:divide-gray-700"
          @submit.prevent="submitLogConfig"
        >
          <!-- Console Section -->
          <div class="pt-6 sm:flex">
            <div
              class="pl-10 text-base font-semibold leading-7 text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6"
            >
              Console
            </div>
            <div v-if="logConfig" class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
              <div class="flex items-center justify-between">
                <span class="mr-4 whitespace-nowrap text-gray-800 dark:text-white">Log Level</span>
                <select
                  v-model="logConfig.consoleLogLevel"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                >
                  <option v-for="level in logConfig.levels" :key="level">{{ level }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- File Section -->
          <div class="pt-6 sm:flex">
            <div
              class="pl-10 text-base font-semibold leading-7 text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6"
            >
              File
            </div>
            <div v-if="logConfig" class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
              <!-- Enable Switch -->
              <UISlideSwitch v-model="logConfig.fileLogEnabled" label="Enabled" class="justify-end" />

              <!-- Log Level -->
              <div class="flex items-center justify-between">
                <span class="mr-4 text-gray-800 dark:text-white">Log Level</span>
                <select
                  v-model="logConfig.fileLogLevel"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                >
                  <option v-for="level in logConfig.levels" :key="level">{{ level }}</option>
                </select>
              </div>

              <!-- Path -->
              <div class="flex items-center justify-between">
                <span class="w-32 text-gray-800 dark:text-white">Path</span>
                <input
                  v-model="logConfig.logPath"
                  type="text"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 12rem"
                />
              </div>

              <!-- Max File Size -->
              <div class="flex items-center justify-between">
                <span class="w-32 text-gray-800 dark:text-white">Max File Size (MB)</span>
                <input
                  v-model="logConfig.maxSize"
                  type="number"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                />
              </div>

              <!-- Days to Retain -->
              <div class="flex items-center justify-between">
                <span class="w-32 text-gray-800 dark:text-white">Days to Retain</span>
                <input
                  v-model="logConfig.maxDays"
                  type="number"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                />
              </div>

              <!-- Zip Archive -->
              <div class="flex items-center justify-between">
                <span class="mr-4 text-gray-800 dark:text-white">Zip Archive</span>
                <UISlideSwitch v-model="logConfig.zipArchive" class="justify-end" />
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
            <div v-if="logConfig" class="mt-1 flex flex-col justify-end gap-x-6 gap-y-2 pr-10 sm:mt-0 sm:flex-auto">
              <!-- Enable -->
              <UISlideSwitch v-model="logConfig.syslogLogEnabled" label="Enabled" class="justify-end" />
              <!-- Log Level -->
              <div class="flex items-center justify-between">
                <span class="mr-4 text-gray-800 dark:text-white">Log Level</span>
                <select
                  v-model="logConfig.syslogLogLevel"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                >
                  <option v-for="level in logConfig.levels" :key="level">{{ level }}</option>
                </select>
              </div>

              <!-- Syslog Target -->
              <div class="flex items-center justify-between">
                <span class="w-32 text-gray-800 dark:text-white">Syslog Target</span>
                <input
                  v-model="logConfig.syslogTarget"
                  type="text"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 12rem"
                />
              </div>

              <!-- Syslog Port -->
              <div class="flex items-center justify-between">
                <span class="w-32 text-gray-800 dark:text-white">Syslog Port</span>
                <input
                  v-model="logConfig.syslogPort"
                  type="number"
                  class="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  style="max-width: 8rem"
                />
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end pr-10 pt-6">
            <button
              type="submit"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LogConfig } from "~/types/log";

definePageMeta({
  layout: "admin",
});

const changeSuccessful = ref(false);
const showErrorNotification = ref(false);
const errorObject = ref();

const { data: logConfig } = await useFetch<LogConfig>("/api/config/logConfig", {
  method: "GET",
  key: "logConfigApi",
});

async function submitLogConfig() {
  try {
    if (!logConfig.value) return;
    const updated = await $fetch<LogConfig>("/api/config/logConfig", {
      method: "PUT",
      body: logConfig.value,
    });
    logConfig.value = updated;
    changeSuccessful.value = true;
    setTimeout(hideNotification, 3000);
  } catch (err) {
    changeSuccessful.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    if (changeSuccessful.value) {
      refreshNuxtData("logConfigApi");
    }
  }
}

function hideNotification() {
  changeSuccessful.value = false;
}
</script>
