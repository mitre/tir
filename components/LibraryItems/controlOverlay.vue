<template>
  <div class="py-10 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-800">
            <thead class="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th scope="col"
                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-6">Overlay
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">Date
                  Added</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">options</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 bg-gray-100 dark:bg-gray-900">
              <tr v-for="control in  ControlOverlays" :key="control.Overlayid">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-6">{{
                  control.overlayName
                }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">{{ control.dateAdded }}
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">

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

import { useStigLibrariesStore } from "../../stores/StigLibraries";
import { storeToRefs } from "pinia";

const store = useStigLibrariesStore();

// storeToRefs lets todoList keep reactivity:
const { ControlOverlays } = storeToRefs(store);

</script>