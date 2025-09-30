<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-lg bg-white py-4 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-0 mx-auto max-w-2xl max-w-none space-y-16 sm:space-y-20">
          <div class="flex-auto">
            <a class="mb-2 flex cursor-pointer text-indigo-500 hover:text-indigo-400" @click="backButton()">
              <ArrowUturnLeftIcon class="mr-2 h-5 w-5" />
              <p>Back</p>
            </a>
            <div class="flex items-center">
              <h4 class="h-8 border-r pr-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
                {{ vulnData.pluginName }}
              </h4>
            </div>
            <div
              class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
            ></div>
          </div>
        </div>
        <div class="flex max-w-7xl gap-x-10 pt-4">
          <main class="flex-auto px-4 px-6 lg:px-0">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-800 dark:text-white">
                  Nessus: {{ vulnData.pluginId }}
                </h2>
                <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div class="text-md mt-2 flex items-center text-gray-800 dark:text-gray-300">
                    <p class="mr-2 font-semibold">Severity:</p>
                    {{ highestSeverity }}
                  </div>
                  <div class="text-md mt-2 flex items-center text-gray-800 dark:text-gray-300">
                    <p class="mr-2 font-semibold">Risk Score:</p>
                    {{
                      vulnData.NessusReportItems[0].cvssTemporalScore ||
                      vulnData.NessusReportItems[0].cvss3TemporalScore ||
                      ""
                    }}
                  </div>
                </div>
              </div>
              <div class="mr-10 mt-auto flex items-end">
                <button
                  class="inline-flex items-end rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="showOverride = true"
                >
                  Systems
                </button>
              </div>
              <div>
                <div class="flex items-center justify-between pb-2"></div>
              </div>
            </div>
            <div class="mt-4 rounded-md bg-gray-900/5 p-4 underline-offset-2 dark:bg-gray-300/5">
              <div class="max-h-80 overflow-y-auto pr-6">
                <h1 class="text-md text-black underline dark:text-white">Vulnerability Description:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ vulnData.description }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Synopsis:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ vulnData.synopsis }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Solution:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ vulnData.solution }}
                </p>
                <h1 class="text-md text-black underline dark:text-white">CVEs:</h1>
                <ul class="pb-4 text-sm text-gray-800 dark:text-gray-300">
                  <li v-for="(cve, index) in vulnData.Cves" :key="index" class="whitespace-pre-line break-words">
                    {{ cve.cveId }}
                  </li>
                </ul>
              </div>

              <label for="finding" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Plugin Output:
              </label>
              <div class="my-2 mb-6">
                <textarea
                  id="finding"
                  placeholder=""
                  readonly
                  name="finding"
                  rows="5"
                  class="block w-full rounded-md border-0 bg-gray-500/5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                  >{{ vulnData.NessusReportItems[0].pluginOutput }}</textarea
                >
              </div>
              <Disclosure v-slot="{ open }" :default-open="true">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg  px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  POAM Fields
                  <ChevronRightIcon :class="[open && 'rotate-90 transform', 'h-6 w-6']" />
                </DisclosureButton>
                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-out"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <DisclosurePanel
                    class="h-84 text-md w-full rounded-b-lg bg-gray-300/5 px-4 py-4 text-left font-medium text-white focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
                  >
                    <PoamFields :evaluation-item="vulnData.NessusPlugin_Boundaries[0].EvaluationItem" />
                  </DisclosurePanel>
                </transition>
              </Disclosure>

              <div class="mt-4 flex justify-end">
                <button
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="editAssessmentApi()"
                >
                  Save
                </button>
              </div>
            </div>
          </main>
          <!-- :BoundaryId="Number(route.params.boundaryId)"
            :StigId="Number(route.params.StigId)"
            :StigDataId="listOfChecks[checkData].id" -->

          <!-- <newOverride v-if="showOverride" :open="showOverride" @show-override="showOverride = false" /> -->
          <!-- <newOverride :isOpen="open" @close="open = false" /> -->
          <newOverride
            :open="showOverride"
            :overrides="overrideData"
            override-class="nessus"
            @update:open="showOverride = $event"
          />
          <ErrorNotification
            v-if="showErrorNotification"
            :show="showErrorNotification"
            :error="errorObject"
            @show="showErrorNotification = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUturnLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
const route = useRoute();
const showErrorNotification = ref(false);
const errorObject = ref();

const { data: vulnData } = await useFetch("/api/vuln/vuln", {
  method: "GET",
  query: { BoundaryId: route.params.boundaryId, VulnId: route.params.vulnId },
  key: "VulnDataAPI",
});

async function backButton() {
  await navigateTo({ path: "/company-boundary/" + route.params.boundaryId, query: { activeView: "VulnView" } });
}

async function editAssessmentApi() {
  try {
    const milestoneText = [];
    vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Milestones.forEach((o) => {
      milestoneText.push(o.item);
    });
    const milestoneDate = [];
    vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Milestones.forEach((o) => {
      milestoneDate.push(o.completion_date);
    });
    await $fetch("/api/evaluation/updateItem", {
      method: "PUT",
      body: {
        id: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.id,
        BoundaryId: route.params.boundaryId,
        Office_Org: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Office_Org,
        Resources_Required: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Resources_Required,
        Scheduled_Completion_Date: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Scheduled_Completion_Date,
        Milestone: milestoneText,
        Milestone_Completion_Dte: milestoneDate,
        Milestone_Changes: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Milestone_Changes,
        Poam_Comments: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Poam_Comments,
        Mitigations: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Mitigations,
        Severity: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Severity,
        Relevance_of_Threat: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Relevance_of_Threat,
        Likelihood: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Likelihood,
        Impact: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Impact,
        Impact_Description: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Impact_Description,
        Residual_Risk_Level: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Residual_Risk_Level,
        Recommendations: vulnData.value.NessusPlugin_Boundaries[0].EvaluationItem.Recommendations,
      },
    });
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

/// /// Overide Popup
const showOverride = ref(false);

// Severity map
const severityMap = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

const highestSeverity = computed(() => {
  let currentHighest = 0;
  for (const reportItem of vulnData.value.NessusReportItems) {
    if (reportItem.statusOverride !== "Not_Applicable" && reportItem.statusOverride !== "NotAFinding") {
      const currentSeverity = reportItem.severityOverride ?? vulnData.value.severity;
      if (currentSeverity > currentHighest) {
        currentHighest = currentSeverity;
      }
    }
  }
  return severityMap[currentHighest];
});

const overrideData = computed(() => {
  return vulnData.value.NessusReportItems.map((reportItem) => {
    const system = reportItem.NessusReport.System;

    return {
      id: reportItem.id,
      systemId: system.id,
      name: system.name,
      severity: severityMap[reportItem.severityOverride] || severityMap[vulnData.value.severity],
      status: reportItem.statusOverride || "Open",
      overrides: {
        id: vulnData.value.id,
        severityOverride: severityMap[reportItem.severityOverride] || null,
        severityOverrideJustification: reportItem.severityOverrideJustification,
        statusOverride: reportItem.statusOverride,
        statusOverrideJustification: reportItem.statusOverrideJustification,
      },
      overrideLocks: vulnData.value.NessusOverrides
        ? vulnData.value.NessusOverrides.filter((override) => override.SystemId === system.id).map((override) => ({
            id: override.id,
            type: override.type,
            // If type is 'severity', map the integer to the severity string
            value:
              override.type === "severity" && severityMap[override.value]
                ? severityMap[override.value]
                : override.value,
          }))
        : [], // Return an empty array if NessusOverrides is null
    };
  });
});
</script>
