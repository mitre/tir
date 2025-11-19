<template>
  <div class="mx-auto max-w-7xl">
    <label
      for="importSctm"
      class="mt-4 inline-flex cursor-pointer items-center gap-x-1.5 rounded-md border border-indigo-500 px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white"
    >
      <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md" aria-hidden="true" />
      Import
    </label>

    <input id="importSctm" type="file" class="hidden" @change="importSctm" />
    <div class="bg-gray-700/10">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-4 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-0"
                    >
                      Abbreviation
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Control Family
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
                    v-for="controlRecord in summary.sctmView"
                    :key="controlRecord.id"
                    :class="['cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-300/5']"
                    @click="
                      [
                        (loading = true),
                        (loadingMsg = `Loading Control Family`),
                        viewSctm(controlRecord.id, summary.boundaryInfo.id),
                      ]
                    "
                  >
                    <td
                      class="break-word relative flex py-4 pl-4 pr-3 text-sm font-medium text-gray-600 dark:text-white sm:pl-0"
                    >
                      {{ controlRecord.abbreviation }}
                    </td>
                    <td class="break-word whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ controlRecord.controlFamilyName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ formatDate(controlRecord.date) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div class="flex">
                        <p class="text-green-500">{{ controlRecord.findings.Compliant }}</p>
                        /
                        <p class="text-red-500">{{ controlRecord.findings.Non_Compliant }}</p>
                        /
                        <p class="text-sky-500">{{ controlRecord.findings.Not_Applicable }}</p>
                        /
                        <p class="text-amber-500">{{ controlRecord.findings.Not_Reviewed }}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <LoadingNotification v-if="loading" :show="loading" :msg="loadingMsg" @show="loading = false" />
              <ErrorNotification
                v-if="showErrorNotification"
                :show="showErrorNotification"
                :error="errorObject"
                @show="showErrorNotification = false"
              />
              <TransitionRoot as="template" :show="showWarnings">
                <Dialog as="div" class="relative z-10" @close="showWarnings = false">
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
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
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
                          class="relative transform overflow-hidden rounded-lg bg-white px-6 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:w-full sm:max-w-4xl"
                        >
                          <div class="mb-4 flex items-center justify-between">
                            <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white"
                              >Import Warnings</DialogTitle
                            >
                            <button
                              @click="showWarnings = false"
                              class="text-gray-500 hover:text-gray-700 dark:hover:text-white"
                            >
                              <XMarkIcon class="h-6 w-6" />
                            </button>
                          </div>
                          <div class="mb-3 flex gap-2">
                            <button
                              @click="copyWarnings"
                              class="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
                            >
                              Copy to Clipboard
                            </button>
                            <button
                              @click="downloadCSV"
                              class="rounded-md bg-green-500 px-3 py-1 text-sm font-medium text-white hover:bg-green-600"
                            >
                              Download CSV
                            </button>
                          </div>
                          <div class="max-h-96 overflow-y-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead>
                                <tr>
                                  <th class="px-2 py-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Control #
                                  </th>
                                  <th class="px-2 py-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Field
                                  </th>
                                  <th class="px-2 py-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Value
                                  </th>
                                  <th class="px-2 py-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Message
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="(w, idx) in warnings" :key="idx">
                                  <td class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300">
                                    {{ w.controlNumber }}
                                  </td>
                                  <td class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300">{{ w.field }}</td>
                                  <td class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300">{{ w.value }}</td>
                                  <td class="px-2 py-1 text-sm text-red-500 dark:text-red-400">{{ w.message }}</td>
                                </tr>
                              </tbody>
                            </table>
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
import { XMarkIcon, PlusIcon } from "@heroicons/vue/24/outline";

const loading = ref(false);
const loadingMsg = ref("");
const errorObject = ref();
const showErrorNotification = ref(false);

const warnings = ref<{ controlNumber: string; field: string; value: any; message: string }[]>([]);
const showWarnings = ref(false);

const props = defineProps({
  summary: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});
const emit = defineEmits(["refreshSummary"]);
function formatDate(isoDate) {
  try {
    const parsedDate = new Date(isoDate);

    const format = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      timeZoneName: "short",
    };
    const formattedDate = parsedDate.toLocaleString("en-US", format);
    if (formattedDate === "Invalid Date") {
      return "";
    }
    return formattedDate;
  } catch (error) {
    return "Invalid date";
  }
}

async function viewSctm(sctmId: number, boundaryId: number) {
  await navigateTo({
    path: "/company-boundary/" + boundaryId + "/SCTM/" + sctmId,
  });
}

async function importSctm(event: { target: { files: any[]; value: string } }) {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  loadingMsg.value = `Importing SCTM Data`;
  loading.value = true;
  try {
    const response: any = await $fetch("/api/control/import", {
      method: "POST",
      query: { boundaryId: props.summary.boundaryInfo.id, version: props.summary.boundaryInfo.PolicyDocument.version },
      body: formData,
    });
    emit("refreshSummary");
    if (response.warnings?.length) {
      warnings.value = response.warnings;
      showWarnings.value = true; // show warnings modal
    }
  } catch (error) {
    loading.value = false;
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    loading.value = false;
    event.target.value = "";
  }
}

function copyWarnings() {
  const text = warnings.value.map((w) => `${w.controlNumber}\t${w.field}\t${w.value}\t${w.message}`).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("Warnings copied to clipboard!");
  });
}

function downloadCSV() {
  const headers = ["Control#", "Field", "Value", "Message"];
  const rows = warnings.value.map((w) => [w.controlNumber, w.field, w.value, w.message]);
  const csvContent = [headers, ...rows].map((row) => row.map((c) => `"${c ?? ""}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "import_warnings.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>
