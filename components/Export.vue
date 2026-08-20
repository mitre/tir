<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="$emit('showExport', false)">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              class="relative overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-5xl sm:p-6"
            >
              <div class="overflow-y-hidden">
                <div class="border-b border-gray-400 pb-5 dark:border-gray-200 sm:pb-0">
                  <div class="mt-3 sm:mt-4">
                    <div class="hidden sm:block">
                      <nav class="-mb-px flex space-x-8">
                        <a
                          v-for="(tab, index) in tabs"
                          :key="tab.name"
                          :href="tab.href"
                          :class="[
                            activeTab === index
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-800 hover:border-gray-300 hover:text-gray-400 dark:text-white',
                            'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                          ]"
                          :aria-current="activeTab === index ? 'page' : undefined"
                          @click.prevent="activeTab = index"
                        >
                          {{ tab.name }}
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="activeTab === 0">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >POAM Creation</DialogTitle
                  >
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download POAM Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="poamDownload"
                  >
                    Download POAM
                  </button>
                </div>
              </div>
              <!-- Finding Tab -->
              <div v-if="activeTab === 1">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Findings Creation
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Select at least one option below</p>
                  </div>
                </div>
                <fieldset>
                  <legend class="sr-only">Notifications</legend>
                  <div class="space-y-5">
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="open"
                          v-model="checkedStatus"
                          value="Open"
                          aria-describedby="open-description"
                          name="open"
                          type="checkbox"
                          :disabled="checkedStatus.includes('RMF')"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="open" class="font-medium text-gray-800 dark:text-white">Open</label>
                        <p id="open-description" class="text-gray-400">Select results with a "Open" Status.</p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="notAfinding"
                          v-model="checkedStatus"
                          value="NotAFinding"
                          aria-describedby="notAfinding-description"
                          name="notAfinding"
                          type="checkbox"
                          :disabled="checkedStatus.includes('RMF')"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notAfinding" class="font-medium text-gray-800 dark:text-white">Not A Finding</label>
                        <p id="notAfinding-description" class="text-gray-400">
                          Select results with a "Not A Finding" Status.
                        </p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="notApplicable"
                          v-model="checkedStatus"
                          value="Not_Applicable"
                          aria-describedby="notApplicable-description"
                          name="notApplicable"
                          type="checkbox"
                          :disabled="checkedStatus.includes('RMF')"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notApplicable" class="font-medium text-gray-800 dark:text-white"
                          >Not Applicable</label
                        >
                        <p id="notApplicable-description" class="text-gray-400">
                          Select results with a "Not Applicable" Status.
                        </p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="notReviewed"
                          v-model="checkedStatus"
                          value="Not_Reviewed"
                          aria-describedby="notReviewed-description"
                          name="notReviewed"
                          type="checkbox"
                          :disabled="checkedStatus.includes('RMF')"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notReviewed" class="font-medium text-gray-800 dark:text-white">Not Reviewed</label>
                        <p id="notReviewed-description" class="text-gray-400">
                          Select results with a "Not Reviewed" Status.
                        </p>
                      </div>
                    </div>
                    <div class="relative flex items-start border-t border-gray-400 pt-5">
                      <div class="flex h-6 items-center">
                        <input
                          id="rmf"
                          v-model="checkedStatus"
                          value="RMF"
                          aria-describedby="open-description"
                          name="rmf"
                          type="checkbox"
                          :disabled="checkedStatus.length > 0 && !checkedStatus.includes('RMF')"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:text-gray-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="open" class="font-medium text-gray-800 dark:text-white">RMF Findings</label>
                        <p id="open-description" class="text-gray-400">
                          Select RMF results with a "Non-Compliant / Not Reviewed" Status.
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    :disabled="checkedStatus.length === 0"
                    :class="[
                      checkedStatus.length === 0 ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-500 ',
                      'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                    ]"
                    @click="findingsDownload"
                  >
                    Download Findings
                  </button>
                </div>
              </div>
              <!-- Checlist Tab -->
              <div v-if="activeTab === 2">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Checklist Creation
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Checklist Settings</p>
                  </div>
                </div>
                <fieldset>
                  <div class="relative my-5 flex items-start">
                    <div class="flex h-6 items-center">
                      <input
                        id="cklv3-cklb"
                        v-model="checklistVersion"
                        value="cklb"
                        aria-describedby="comments-description"
                        type="radio"
                        class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div class="ml-3 text-sm leading-6">
                      <label for="cklv3-cklb" class="font-medium text-gray-800 dark:text-white"
                        >Checklist Version 3 (.cklb)</label
                      >
                    </div>
                    <div class="ml-6 flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="cklv2"
                          v-model="checklistVersion"
                          value="ckl"
                          aria-describedby="comments-description"
                          type="radio"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="cklv2" class="font-medium text-gray-800 dark:text-white"
                          >Checklist Version 2 (.ckl)</label
                        >
                      </div>
                    </div>
                  </div>
                  <div class="relative my-5 flex items-start">
                    <div class="flex h-6 items-center">
                      <input
                        id="system"
                        v-model="groupValue"
                        value="system"
                        aria-describedby="comments-description"
                        type="radio"
                        class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div class="group relative ml-3 text-sm leading-6">
                      <label for="cklv3-cklb" class="cursor-help font-medium text-gray-800 dark:text-white">
                        Group by system name
                      </label>
                      <div
                        class="pointer-events-none absolute left-0 top-full z-10 mt-1 w-56 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition delay-0 group-hover:opacity-100 group-hover:delay-1000"
                      >
                        Groups results by the system name as seen in TIR.
                      </div>
                    </div>
                    <div class="ml-6 flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          id="host"
                          v-model="groupValue"
                          value="host"
                          aria-describedby="comments-description"
                          type="radio"
                          class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="group relative ml-3 text-sm leading-6">
                        <label for="cklv2" class="cursor-help font-medium text-gray-800 dark:text-white"
                          >Group by hostname</label
                        >
                        <div
                          class="pointer-events-none absolute left-0 top-full z-10 mt-1 w-56 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition delay-0 duration-200 group-hover:opacity-100 group-hover:delay-1000"
                        >
                          Groups results by the hostname. When no hostname is defined defaults to system name.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="relative flex items-start">
                    <div class="flex h-6 items-center">
                      <input
                        id="singleStigPerCkl"
                        v-model="singleStigPerChecklist"
                        aria-describedby="comments-description"
                        name="singleStigPerCkl"
                        type="checkbox"
                        class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div class="ml-3 text-sm leading-6">
                      <label for="comments" class="font-medium text-gray-800 dark:text-white"
                        >Single STIG per Checklist</label
                      >
                      <p id="comments-description" class="text-gray-300">
                        Create a checklist for each STIG instead of a single checklist per System.
                      </p>
                    </div>
                  </div>
                  <div class="relative flex items-start">
                    <div class="flex h-6 items-center">
                      <input
                        id="ignoreOverrides"
                        v-model="ignoreSTIGStatusOverrides"
                        aria-describedby="comments-description"
                        name="ignoreOverrides"
                        type="checkbox"
                        class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div class="ml-3 text-sm leading-6">
                      <div class="group relative text-sm leading-6">
                        <label for="ignoreOverrides" class="cursor-help font-medium text-gray-800 dark:text-white"
                        >Ignore TIR Status Overrides</label>
                        <div
                          class="pointer-events-none absolute left-0 top-full z-10 mt-1 w-56 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition delay-0 duration-200 group-hover:opacity-100 group-hover:delay-1000"
                        >
                        Selecting this will export checklists without TIR System Status Overrides.
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="cklDownload"
                  >
                    Download Checklist
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 3">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >STIG Security Assessment Creation
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download STIG Security Assessment Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="ssaDownload"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 4">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Nessus
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download Nessus Export Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="nessusDownload"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 5">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >PPSM
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download PPSM Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="ppsmDownload"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 6">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Heimdall Data Format
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download HDF Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="hdfDownload"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div v-if="activeTab === 7">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Software List Export
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download SW List Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="softwareListDownload"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 8">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >SCTM
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download SCTM Below</p>
                  </div>
                </div>
                <fieldset>
                  <div class="space-y-5">
                    <div v-for="option in sctmOptions" :key="option.value" class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input
                          :id="option.value"
                          v-model="checkedSctmStatus"
                          :value="option.value"
                          aria-describedby="eMASS-description"
                          name="status"
                          type="radio"
                          class="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label :for="option.value" class="font-medium text-gray-800 dark:text-white">
                          {{ option.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    :disabled="!checkedSctmStatus"
                    :class="[
                      !checkedSctmStatus ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-500',
                      'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                    ]"
                    @click="sctmDownload"
                  >
                    Download
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { NessusCsvHeaders } from "~/types/nessus";

const props = defineProps({
  boundaryId: {
    type: Number,
    required: true,
  },
  open: {
    type: Boolean,
    required: true,
  },
  boundaryName: {
    type: String,
    required: true,
  },
});
const checkedStatus = ref<string[]>([]);
const sctmOptions = [
  { value: "eMASS", label: "eMASS Implementation Plan", fileSuffix: "-eMASS-ImplementationPlan.xlsx" },
  { value: "sctm", label: "SCTM", fileSuffix: "-SCTM.xlsx" },
  { value: "sca", label: "Security Control Assessment", fileSuffix: "-Security-Control-Assessment.xlsx" },
] as const;

type SctmStatus = (typeof sctmOptions)[number]["value"];

const checkedSctmStatus = ref<SctmStatus>("eMASS");

const { boundaryId, open, boundaryName } = props;

const poamDownload = async () => {
  const bodyData = {
    BoundaryId: boundaryId,
  };

  await fetch("/api/boundaries/poamDownload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}-POAM.xlsx`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const findingsDownload = async () => {
  const { data: currentUser } = await useFetch("/api/auth/currentUser");
  const bodyData = {
    BoundaryId: boundaryId,
    filterStatus: checkedStatus.value,
    userEmail: currentUser.value.email,
  };

  await fetch("/api/boundaries/findingsDownload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const filename = checkedStatus.value.includes("RMF") ? `${boundaryName}-RMF` : boundaryName;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}-Findings.xlsx`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const checklistVersion = ref("cklb");
const singleStigPerChecklist = ref(false);
const ignoreSTIGStatusOverrides = ref(false);
const groupValue = ref("system");

const cklDownload = async () => {
  const queryParams = new URLSearchParams();
  queryParams.append("BoundaryId", boundaryId.toString());
  queryParams.append("groupValue", groupValue.value);
  if (singleStigPerChecklist.value) {
    queryParams.append("SingleStigPerCkl", "true");
  }
  queryParams.append("IgnoreOverrides", ignoreOverrides.value);
  
  if (checklistVersion.value === "cklb") {
    await fetch(`/api/export/cklv3?${queryParams}`, {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/zip" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${boundaryName}-ChecklistsV3.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  } else {
    await fetch(`/api/boundaries/ckl2?${queryParams}`, {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/zip" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${boundaryName}-Checklists.zip`);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      });
  }
};

const ssaDownload = async () => {
  const bodyData = {
    BoundaryId: boundaryId,
  };
  await fetch("/api/boundaries/ssaDownload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}-STIG-Security-Assessment.xlsx`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const nessusDownload = async () => {
  const selectedHeaders = [
    NessusCsvHeaders.PluginId,
    NessusCsvHeaders.CVE,
    NessusCsvHeaders.CvssV2,
    NessusCsvHeaders.CvssV3,
    NessusCsvHeaders.Risk,
    NessusCsvHeaders.Host,
    NessusCsvHeaders.Protocol,
    NessusCsvHeaders.Port,
    NessusCsvHeaders.Name,
    NessusCsvHeaders.Description,
    NessusCsvHeaders.PluginOutput,
  ] as const;

  const queryParams = new URLSearchParams();
  queryParams.append("BoundaryId", boundaryId);
  queryParams.append("selectedHeaders", selectedHeaders);
  await fetch(`/api/boundaries/nessus?${queryParams}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}_NessusExport.csv`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const ppsmDownload = async () => {
  const { data: currentUser } = await useFetch("/api/auth/currentUser");

  const queryParams = new URLSearchParams();
  queryParams.append("BoundaryId", boundaryId);
  queryParams.append("userEmail", currentUser.value.email);
  await fetch(`/api/boundaries/ppsm?${queryParams}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}_ppsm.xlsx`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const hdfDownload = async () => {
  const queryParams = new URLSearchParams();
  queryParams.append("BoundaryId", boundaryId);
  await fetch(`/api/export/hdf?${queryParams}`, {
    method: "GET",
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}-HDF.json`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const softwareListDownload = async () => {
  const { data: currentUser } = await useFetch("/api/auth/currentUser");
  const queryParams = new URLSearchParams();
  queryParams.append("BoundaryId", boundaryId);
  queryParams.append("userEmail", currentUser.value.email);
  await fetch(`/api/export/sw?${queryParams}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${boundaryName}_SW_HW_Export.xlsx`);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    });
};

const sctmDownload = async () => {
  const blob = await $fetch("/api/boundaries/sctmDownload", {
    method: "GET",
    params: {
      BoundaryId: boundaryId,
      filterValue: checkedSctmStatus.value,
    },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const opt = sctmOptions.find((o) => o.value === checkedSctmStatus.value);
  const fileName = `${boundaryName}${opt?.fileSuffix ?? ""}`;

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const activeTab = ref(0);

const tabs = [
  { name: "POAM", href: "#" },
  { name: "Findings", href: "#" },
  { name: "Checklist", href: "#" },
  { name: "STIG Security Assessment", href: "#" },
  { name: "Nessus", href: "#" },
  { name: "PPSM", href: "#" },
  { name: "HDF", href: "#" },
  { name: "Software List", href: "#" },
  { name: "SCTM", href: "#" },
];
</script>
