<template>
  <main class="">
    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <!-- <BoundaryItems/> -->
      <!-- <CompanyList /> -->
      <CompanyBoundaries v-if="stigLibrary.length != 0 && rmfLibrary.length != 0" />
      <div v-else class="flex h-full items-center justify-center py-12">
        <div
          class="flex w-full max-w-4xl flex-col items-center space-y-6 rounded-xl bg-white px-6 py-10 shadow-lg dark:bg-gray-800 sm:px-8"
        >
          <div class="flex items-center space-x-6">
            <ExclamationTriangleIcon class="h-12 w-12 text-yellow-400" />
            <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              STIG Library & CCI Matrix Required
            </h1>
          </div>
          <p class="max-w-2xl text-center text-lg text-gray-700 dark:text-gray-300">
            To continue, please click the "Libraries" tab to import the required STIG library & CCI Matrix. This will
            enable essential features and ensure the proper functionality of your application. For further details,
            please refer to the <span class="font-semibold text-gray-900 dark:text-white">General User Guide</span>.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
const { data: currentAlias } = await useFetch("/api/config/alias");
const boundaryView = currentAlias.value.find((alias) => alias.term === "Boundary");
const { data: stigLibrary } = await useFetch("/api/stigLibrary");
const { data: rmfLibrary } = await useFetch("/api/boundaries/listRMFVersions");
</script>
