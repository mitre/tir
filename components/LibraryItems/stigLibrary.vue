<template>
  <div class="flow-root py-10">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="w-full table-fixed divide-y divide-gray-800">
            <thead class="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  class="w-[12%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-6"
                >
                  Classification
                </th>
                <th
                  scope="col"
                  class="w-[15%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  Library Date
                </th>
                <th
                  scope="col"
                  class="w-[8%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  STIGs
                </th>
                <th
                  scope="col"
                  class="w-[30%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  File
                </th>
                <th
                  scope="col"
                  class="w-[35%] py-3.5 pl-8 pr-4 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pr-6"
                >
                  Import Date
                </th>
              </tr>
            </thead>
            <!-- <tbody class="divide-y divide-gray-800 bg-gray-900">
                <tr  >
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">Test</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-200">Test</td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    
                  </td>
                </tr>
              </tbody> -->
            <tbody class="divide-y divide-gray-800 bg-gray-100 dark:bg-gray-900">
              <tr v-for="library in sortedLibraries" :key="library.id">
                <td class="w-[12%] py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-6">
                  {{ library.classification }}
                </td>
                <td class="w-[15%] py-4 pl-4 pr-3 text-sm text-gray-800 dark:text-gray-200">
                  {{ formatLibraryDate(library.libraryDate) }}
                </td>
                <td class="w-[8%] py-4 pl-4 pr-3 text-left text-sm text-gray-800 dark:text-gray-200">
                  {{ library.stigCount }}
                </td>
                <td class="w-[30%] py-4 pl-4 pr-3 text-sm text-gray-800 dark:text-gray-200">
                  <div class="truncate" :title="library.filename">{{ library.filename }}</div>
                </td>
                <td class="relative w-[35%] py-4 pl-8 pr-4 text-sm sm:pr-6">
                  <div class="w-full">
                    <template v-if="jobFor(library.id)">
                      <UProgress
                        :value="jobFor(library.id).percent"
                        max="100"
                        :color="jobFor(library.id).phase === 'done' ? 'green' : 'primary'"
                      />
                      <p class="truncate text-left text-xs text-gray-500 dark:text-gray-400">
                        {{ jobFor(library.id).message }}
                      </p>
                    </template>
                    <span v-else class="text-gray-800 dark:text-gray-200">
                      {{ formatCompleted(library.importedDate) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from "luxon";

const { data: StigLibraries, refresh } = useFetch("/api/stigLibrary/");

// ISO dates sort chronologically as plain strings, newest first
const sortedLibraries = computed(() =>
  [...(StigLibraries.value ?? [])].sort((a, b) =>
    (b.libraryDate ?? "").localeCompare(a.libraryDate ?? ""),
  ),
);

function jobFor(libraryId) {
  return props.activeImports[libraryId] || null;
}

function formatLibraryDate(libraryDate) {
  if (!libraryDate) return "";
  const dt = DateTime.fromISO(libraryDate);
  return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : libraryDate;
}

// legacy rows are date-only, newer ones full ISO datetime
function formatCompleted(importedDate) {
  if (!importedDate) return "";
  const dt = DateTime.fromISO(importedDate);
  if (!dt.isValid) return importedDate;
  return importedDate.includes("T")
    ? dt.toLocaleString(DateTime.DATETIME_MED)
    : dt.toLocaleString(DateTime.DATE_MED);
}

const props = defineProps({
  refreshTrigger: {
    type: Boolean,
    default: false,
  },
  activeImports: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => props.refreshTrigger,
  () => refresh(),
);
</script>
