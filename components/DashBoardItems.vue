<template>
  <div class="rounded-lg bg-white py-24 dark:bg-gray-800">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0">
        <h2 class="text-3xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-4xl">
          Test Ingest Repository.
        </h2>
        <p class="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-400">
          TIR is a central repository to maintain your
          {{ inflection.pluralize(boundaryView.alias.toLowerCase()) }} security posture.
        </p>
        <h4 class="mt-12 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
          See Your Updates Below
        </h4>
      </div>
      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 pt-10 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      >
        <article>
          <h1 class="text-lg font-bold text-gray-800 dark:text-white">{{ boundaryView.alias }} Changes</h1>
          <div class="flex max-w-xl flex-col items-start justify-between">
            <DashBoarditemsBoundaryChanges />
          </div>
        </article>
        <article>
          <h1 class="text-lg font-bold text-gray-800 dark:text-white">New Libraries Imported</h1>
          <div class="flex max-w-xl flex-col items-start justify-between">
            <DashBoarditemsNewLibraries />
          </div>
        </article>

        <article>
          <h1 class="text-lg font-bold text-gray-800 dark:text-white">Upcoming Dates</h1>
          <div class="flex max-w-xl flex-col items-start justify-between">
            <DashBoarditemsDates />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import inflection from "inflection";

const { data: currentAlias } = await useFetch("/api/boundaries/alias");
const boundaryView = ref(currentAlias.value[1]);
</script>
