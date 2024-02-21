<template>
  <div class="mx-auto max-w-7xl">
    <div class="bg-gray-700/10">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-8 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-0"
                    >
                      STIG Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Version
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Date
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Last Update
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Finding Status
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                  <tr
                    v-for="stig in summary.boundaryView"
                    :key="stig.id"
                    class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-300/5"
                    @click="
                      [
                        (loading = true),
                        (StigName = stig.title),
                        (Version = stig.version),
                        (StigDate = stig.date),
                        router.push(
                          '/boundaries/' +
                            route.params.boundary +
                            'id' +
                            route.params.id +
                            '/BoundaryView/' +
                            route.params.BoundaryId +
                            '-' +
                            stig.id,
                        ),
                      ]
                    "
                  >
                    <!-- @click="router.push('/boundaries/' + route.params.boundary +  'id' + route.params.id + '/BoundaryView/' + route.params.BoundaryId + '-' + stig.id )" -->
                    <td class="break-word py-4 pl-4 pr-3 text-sm font-medium text-gray-600 dark:text-white sm:pl-0">
                      {{ stig.title }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ stig.version }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ stig.date }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ stig.lastUpdate }}
                    </td>

                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div class="flex">
                        <p class="text-green-500">{{ stig.findings.NotAFinding }}</p>
                        /
                        <p class="text-red-500">{{ stig.findings.Open }}</p>
                        /
                        <p class="text-sky-500">{{ stig.findings.Not_Applicable }}</p>
                        /
                        <p class="text-amber-500">{{ stig.findings.Not_Reviewed }}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                              <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-white">
                                Loading Evaluation
                              </DialogTitle>
                              <div class="mb-12 mt-2">
                                <p class="text-sm text-black dark:text-white">Please Wait...</p>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { useEvaluationDataStore } from "~~/stores/EvaluationData";
import { useIdStorageStore } from "~~/stores/IdStorage";

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const { data: summary } = await useFetch("/api/boundaries/summary", {
  method: "GET",
  query: { BoundaryId: route.params.BoundaryId },
});

const store = useEvaluationDataStore();
const { BoundaryName, StigName, Version, StigDate } = storeToRefs(store);
BoundaryName.value = route.params.details;

const tempStore = useIdStorageStore();
const { assessmentId } = storeToRefs(tempStore);
assessmentId.value = 0;
const { selectedFilterStore } = storeToRefs(tempStore);
selectedFilterStore.value = [];
</script>
