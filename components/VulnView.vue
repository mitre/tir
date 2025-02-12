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
                      Vulnerability Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      CVE
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Nessus Plugin
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Severity
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Risk Score
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Affected Systems
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                  <tr
                    v-for="vuln in summary.vulnView"
                    :key="vuln.id"
                    :class="[
                      'cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-300/5',
                      { 'line-through dark:decoration-gray-300': vuln.status !== 'Open' },
                    ]"
                    @click="[(loading = true), viewVuln(vuln.id, summary.boundaryInfo.id)]"
                  >
                    <td
                      class="break-word group relative flex py-4 pl-4 pr-3 text-sm font-medium text-gray-600 dark:text-white sm:pl-0"
                    >
                      <div v-if="vuln.status !== 'Open'">
                        <LinkSlashIcon class="h-5 w-5" />
                        <div
                          class="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-400 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-800"
                        >
                          This finding's status has been overriden to {{ vuln.status }}
                        </div>
                      </div>
                      {{ vuln.pluginName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span v-for="(cve, index) in vuln.Cves" :key="cve.id">
                        {{ cve.cveId }}<br v-if="index < vuln.Cves.length - 1" />
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ vuln.pluginId }}
                    </td>
                    <td class="items-center whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div class="group relative flex">
                        {{ vuln.riskFactor }}
                        <div v-if="vuln.riskOverride">
                          <ShieldExclamationIcon class="hover-text h-6 w-6 pl-1" />
                          <div
                            class="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-400 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-800"
                          >
                            This severity has been overriden.
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{
                        vuln.NessusReportItems[0].cvss3TemporalScore ||
                        vuln.NessusReportItems[0].cvssTemporalScore ||
                        ""
                      }}
                    </td>
                    <td class="align-right whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ vuln.NessusReportItems.length }}
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
                                Loading Vulnerability
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

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { XMarkIcon, LinkSlashIcon, ShieldExclamationIcon } from "@heroicons/vue/24/outline";
// import { storeToRefs } from "pinia";
// import { useIdStorageStore } from "~~/stores/IdStorage";

const loading = ref(false);
// const tempStore = useIdStorageStore();
// const { assessmentId, BoundaryId } = storeToRefs(tempStore);

defineProps({
  summary: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});

// assessmentId.value = 0; ?? Is this needed?
// const { selectedFilterStore } = storeToRefs(tempStore);
// selectedFilterStore.value = [];

async function viewVuln(vulnId: number, boundaryId: number) {
  await navigateTo({
    path: "/company-boundary/" + boundaryId + "/VulnView/" + vulnId,
  });
}
</script>
