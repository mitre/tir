<template>
  <div class="pr-8">
    <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">Language and dates</h2>
    <p class="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-200">
      Choose what language and date format to use throughout your account.
    </p>

    <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
      <!-- Language Section -->
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Language</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <div class="text-gray-800 dark:text-white">English</div>
          <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
        </dd>
      </div>

      <!-- Date Format Section -->
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Date format</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <div class="text-gray-800 dark:text-white">DD-MM-YYYY</div>
          <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
        </dd>
      </div>

      <!-- Timezone Switch -->
      <SwitchGroup as="div" class="flex pt-6">
        <SwitchLabel as="dt" class="flex-none pr-6 font-medium text-gray-800 dark:text-white sm:w-64" passive>
          Automatic timezone
        </SwitchLabel>
        <dd class="flex flex-auto items-center justify-end">
          <Switch
            v-model="automaticTimezoneEnabled"
            :class="[
              automaticTimezoneEnabled ? 'bg-indigo-600' : 'bg-gray-200',
              'flex w-8 cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
            ]"
          >
            <span
              aria-hidden="true"
              :class="[
                automaticTimezoneEnabled ? 'translate-x-3.5' : 'translate-x-0',
                'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out',
              ]"
            />
          </Switch>
        </dd>
      </SwitchGroup>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

const automaticTimezoneEnabled = ref(true);

definePageMeta({
  layout: "admin",
});
</script>
