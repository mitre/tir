<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-lg bg-white py-4 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-0 mx-auto max-w-2xl max-w-none space-y-16 sm:space-y-20">
          <div class="flex-auto">
            <!-- Wrap Back button and Header in a flex container -->
            <div class="mb-4 flex items-center space-x-4">
              <a class="flex cursor-pointer text-indigo-500 hover:text-indigo-400" @click="backButton()">
                <ArrowUturnLeftIcon class="mr-2 h-5 w-5" />
                <p>Back</p>
              </a>
              <h4 class="text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
                {{ BoundaryName }} | {{ controlRecord[0].family }}
              </h4>
            </div>

            <!-- Grid Section -->
            <div
              class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
            ></div>
          </div>
        </div>

        <div class="flex max-w-7xl gap-x-10 pt-4">
          <!-- Side menu popup -->
          <aside class="flex min-w-max flex-col gap-y-5 overflow-y-auto bg-white py-2 pr-4 dark:bg-gray-800">
            <nav class="flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-4">
                <!-- Status Filters -->
                <li>
                  <div class="text-xs font-semibold leading-6 text-gray-800 dark:text-white">Filters</div>
                  <div
                    class="mx-auto mt-1 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                  ></div>
                  <ul role="list" class="-mx-2 space-y-1">
                    <li v-for="(item, index) in filter" :key="item.name">
                      <a
                        :href="item.href"
                        :class="[
                          item.current && index === 0
                            ? 'text-red-500 hover:text-red-400'
                            : item.current && index === 1
                              ? 'text-green-500 hover:text-green-400'
                              : item.current && index === 2
                                ? 'text-sky-500 hover:text-sky-400'
                                : item.current && index === 3
                                  ? 'text-amber-500 hover:text-amber-400'
                                  : index === 0
                                    ? 'text-gray-400 hover:text-red-500'
                                    : index === 1
                                      ? 'text-gray-400 hover:text-green-500'
                                      : index === 2
                                        ? 'text-gray-400 hover:text-sky-500'
                                        : index === 3
                                          ? 'text-gray-400 hover:text-amber-500'
                                          : 'text-gray-200',
                          '  group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                        ]"
                        @click="[(item.current = !item.current), addFilter(item.name), getFilterItems()]"
                      >
                        <span
                          :class="[
                            index === 0
                              ? 'bg-red-500'
                              : index === 1
                                ? 'bg-green-500'
                                : index === 2
                                  ? 'bg-sky-500'
                                  : 'bg-amber-500',
                            'relative inline-flex h-2 w-2 self-center rounded-full ',
                          ]"
                        ></span>
                        {{ item.name }}
                        <span
                          v-if="item.count"
                          class="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-800 ring-1 ring-inset ring-gray-700 dark:bg-gray-900 dark:text-white"
                          aria-hidden="true"
                          >{{ item.count }}</span
                        >
                      </a>
                    </li>
                  </ul>
                </li>

                <!-- Check Select -->
                <li>
                  <div class="text-xs font-semibold leading-6 text-gray-800 dark:text-white">Controls</div>
                  <div
                    class="mx-auto mt-1 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                  ></div>
                  <ul role="list" class="-mx-2 mt-2 max-h-96 space-y-1 overflow-hidden hover:overflow-y-auto">
                    <li v-for="check in getFilterItems()" :key="check.id">
                      <a
                        :href="'#'"
                        class="group flex items-center rounded-md bg-white p-2 text-sm font-semibold leading-6 text-gray-800 dark:bg-gray-800 dark:text-white"
                        @click="[findCheck(check.ControlRecordItemId), setFields(check)]"
                      >
                        <span
                          :class="[
                            check.ComplianceStatusId === 1
                              ? 'text-green-400'
                              : check.ComplianceStatusId === 2
                                ? 'text-red-500'
                                : check.ComplianceStatusId === 3
                                  ? 'text-sky-500'
                                  : check.ComplianceStatusId === 4
                                    ? 'text-amber-500'
                                    : 'text-white',
                          ]"
                        >
                          {{ check.number || "Error" }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </aside>
          <main class="flex-auto px-4 px-6 lg:px-0">
            <!-- CHECK INFO BOX -->
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-800 dark:text-white">
                  {{ listOfItems[recordId].number }}
                </h2>
              </div>
              <Listbox v-model="controlRecordItem.ComplianceStatusId" as="div">
                <div class="relative">
                  <div class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
                    <div
                      class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                    >
                      <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                      <p class="text-sm font-semibold">{{ selected.title }}</p>
                    </div>
                    <ListboxButton
                      class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      <ChevronDownIcon class="h-5 w-5 text-white" aria-hidden="true" />
                    </ListboxButton>
                  </div>

                  <transition
                    leave-active-class="transition ease-in duration-100"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <ListboxOptions
                      class="absolute right-0 z-10 mt-2 w-60 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900"
                    >
                      <ListboxOption
                        v-for="option in statusOptions"
                        as="template"
                        :key="option.title"
                        v-slot="{ active, selected }"
                        :value="option.id"
                      >
                        <li
                          :class="[
                            active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-200',
                            'cursor-default select-none p-4 text-sm',
                          ]"
                        >
                          <div class="flex flex-col">
                            <div class="flex justify-between">
                              <p :class="selected ? 'font-semibold' : 'font-normal'">{{ option.title }}</p>
                              <span v-if="selected" :class="active ? 'text-white' : 'text-indigo-600'">
                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                              </span>
                            </div>
                          </div>
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </div>
            <div class="mt-4 max-w-5xl rounded-md bg-gray-900/5 py-4 pl-4 underline-offset-2 dark:bg-gray-300/5">
              <div class="mb-8 max-h-80 overflow-y-auto">
                <h1 class="text-black underline dark:text-white">Control Title:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfItems[recordId].title }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Control Information:</h1>
                <div class="pb-4 text-sm text-gray-800 dark:text-gray-300">
                  <template v-for="line in formattedLines" :key="line.id">
                    <div :style="{ paddingLeft: line.level * 16 + 'px' }">• {{ line.text }}</div>
                  </template>
                </div>
                <h1 class="text-md text-black underline dark:text-white">Supplemental Guidance:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfItems[recordId].guidance }}
                </p>
              </div>
              <Disclosure v-slot="{ open }" :default-open="true" as="div" class="mb-2 pr-4">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  Implementation
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
                    <sctmImplementationPlan
                      v-if="dropdowns"
                      :evaluation-item="controlRecordItem"
                      :implementation-status="dropdowns['implementation-statuses'] || []"
                      :provider="dropdowns['common-control-providers'] || []"
                      :designation="dropdowns['security-control-designations'] || []"
                      :test-methods="dropdowns['test-methods'] || []"
                    />
                  </DisclosurePanel>
                </transition>
              </Disclosure>
              <Disclosure v-slot="{ open }" :default-open="true" as="div" class="mb-2 pr-4">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  Continuous Monitoring
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
                    <sctmContinuousMonitoring
                      v-if="dropdowns"
                      :evaluation-item="controlRecordItem"
                      :frequency-types="dropdowns['frequency-types'] || []"
                      :conmon-methods="dropdowns['conmon-methods'] || []"
                    />
                  </DisclosurePanel>
                </transition>
              </Disclosure>
              <Disclosure v-slot="{ open }" :default-open="true" as="div" class="mb-2 pr-4">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  Risk Assessment
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
                    <sctmRiskAssessment
                      v-if="dropdowns"
                      :evaluation-item="controlRecordItem"
                      :risk-level="dropdowns['risk-levels'] || []"
                    />
                  </DisclosurePanel>
                </transition>
              </Disclosure>
              <Disclosure v-slot="{ open }" :default-open="true" as="div" class="mb-2 pr-4">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  Security Assessment
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
                    <sctmSecurityAssessment
                      v-if="dropdowns"
                      :evaluation-item="controlRecordItem"
                      :compliance-status="dropdowns['compliance-statuses'] || []"
                    />
                  </DisclosurePanel>
                </transition>
              </Disclosure>

              <div class="m-4 flex justify-end">
                <button
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="saveControlRecordItem()"
                >
                  Save
                </button>
              </div>
            </div>
          </main>
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

<script setup>
import { FolderIcon, HomeIcon, UsersIcon } from "@heroicons/vue/24/outline";
import {
  ArrowUturnLeftIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useIdStorageStore } from "~~/stores/IdStorage";

const route = useRoute();
const showErrorNotification = ref(false);
const errorObject = ref();
const store = useIdStorageStore();
const { assessmentId: recordId, selectedFilterStore, BoundaryName } = storeToRefs(store);

const { data: dropdowns, error: dropdownError } = await useFetch("/api/control/dropdown", {
  method: "GET",
});
const controlBoundary = {
  controlRecordId: route.params.sctmId,
  BoundaryId: route.params.boundaryId,
};

const { data: controlRecord, error: queryError } = await useFetch("/api/control/getSummary", {
  method: "GET",
  query: controlBoundary,
  key: "controlRecordAPI",
});

// Filter Items
const controlRecordItems = computed(() => {
  return controlRecord.value || []; // Default to empty array if StigData is not available
});
function countByStatus(status) {
  return computed(() => controlRecordItems.value.filter((item) => item.ComplianceStatusId === status).length);
}
const compliantCount = countByStatus(1);
const nonCompliantCount = countByStatus(2);
const notApplicableCount = countByStatus(3);
const notReviewedCount = countByStatus(4);
const filter = [
  {
    name: "Non-Compliant",
    href: "#",
    icon: HomeIcon,
    count: nonCompliantCount,
    current: selectedFilterStore.value.find((o) => o === "Non-Compliant"),
  },
  {
    name: "Compliant",
    href: "#",
    icon: UsersIcon,
    count: compliantCount,
    current: selectedFilterStore.value.find((o) => o === "Compliant"),
  },
  {
    name: "Not-Applicable",
    href: "#",
    icon: FolderIcon,
    count: notApplicableCount,
    current: selectedFilterStore.value.find((o) => o === "Not-Applicable"),
  },
  {
    name: "Not Reviewed",
    href: "#",
    icon: CalendarIcon,
    count: notReviewedCount,
    current: selectedFilterStore.value.find((o) => o === "Not Reviewed"),
  },
];
const selectedFilter = selectedFilterStore;
const statusMap = {
  1: "Compliant",
  2: "Non-Compliant",
  3: "Not-Applicable",
  4: "Not Reviewed",
};
function getFilterItems() {
  if (selectedFilter.value.length === 0) {
    return listOfItems.value;
  } else {
    const filteredList = listOfItems.value.filter((item) => {
      const statusName = statusMap[item.ComplianceStatusId];
      return selectedFilter.value.includes(statusName);
    });

    return filteredList;
  }
}

function addFilter(name) {
  if (selectedFilter.value.findIndex((o) => o === name) !== -1) {
    const del = selectedFilter.value.findIndex((o) => o === name);
    selectedFilter.value.splice(del, 1);
    selectedFilterStore.value = selectedFilter.value;
  } else {
    selectedFilter.value.push(name);
    selectedFilterStore.value = selectedFilter.value;
  }
}

const listOfItems = computed(() => {
  return [...(controlRecordItems.value || [])].sort((a, b) => {
    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });
});
const controlRecordItem = ref(listOfItems.value[recordId.value] || null);
const complianceStatus = ref("");
const startingPosition = ref();

function findCheck(checkId) {
  recordId.value = listOfItems.value.findIndex((o) => o.ControlRecordItemId === checkId);
}
// Finding Status

const statusOptions = [
  { id: 2, title: "Non-Compliant" },
  { id: 1, title: "Compliant" },
  { id: 3, title: "Not-Applicable" },
  { id: 4, title: "Not Reviewed" },
];
const selected = computed(() => {
  // Ensure that listOfChecks and assessmentId are available and valid
  const currentRecord = listOfItems.value[recordId.value];
  if (currentRecord) {
    complianceStatus.value = currentRecord.ComplianceStatusId;
    startingPosition.value = statusOptions.findIndex((o) => o.id === complianceStatus.value);
    return statusOptions[startingPosition.value] || statusOptions[0]; // Default to the first option if not found
  }
  return statusOptions[0]; // Default to the first option if no check is found
});

// Back Button
async function backButton() {
  await navigateTo("/company-boundary/" + route.params.boundaryId);
}

// Sctm Fields
function setFields(check) {
  controlRecordItem.value = check;
  complianceStatus.value = listOfItems.value[recordId.value].ComplianceStatusId;
  startingPosition.value = statusOptions.findIndex((o) => o.id === complianceStatus.value);
}

async function saveControlRecordItem() {
  try {
    const body = {
      ControlRecordItemId: controlRecordItem.value.ControlRecordItemId,
      BoundaryId: route.params.boundaryId,
      ComplianceStatusId: controlRecordItem.value.ComplianceStatusId,
      ImplementationStatusId: controlRecordItem.value.ImplementationStatusId,
      CommonControlProviderId: controlRecordItem.value.CommonControlProviderId,
      systemProvider: controlRecordItem.value.systemProvider,
      SecurityControlDesignationId: controlRecordItem.value.SecurityControlDesignationId,
      TestMethodId: controlRecordItem.value.TestMethodId,
      naJustification: controlRecordItem.value.naJustification,
      estimatedCompletionDate: controlRecordItem.value.estimatedCompletionDate,
      implementationNarrative: controlRecordItem.value.implementationNarrative,
      responsibleEntities: controlRecordItem.value.responsibleEntities,
      criticality: controlRecordItem.value.criticality,
      FrequencyTypeId: controlRecordItem.value.FrequencyTypeId,
      ConMonMethodId: controlRecordItem.value.ConMonMethodId,
      reporting: controlRecordItem.value.reporting,
      tracking: controlRecordItem.value.tracking,
      conmonComments: controlRecordItem.value.conmonComments,
      SeverityId: controlRecordItem.value.SeverityId,
      RelevanceOfThreatId: controlRecordItem.value.RelevanceOfThreatId,
      LikelihoodId: controlRecordItem.value.LikelihoodId,
      ImpactId: controlRecordItem.value.ImpactId,
      ResidualRiskLevelId: controlRecordItem.value.ResidualRiskLevelId,
      vulnerabilitySummary: controlRecordItem.value.vulnerabilitySummary,
      mitigations: controlRecordItem.value.mitigations,
      impactDescription: controlRecordItem.value.impactDescription,
      recommendations: controlRecordItem.value.recommendations,
      auditor: controlRecordItem.value.auditor,
      AuditControlStatusId: controlRecordItem.value.AuditControlStatusId,
      auditDate: controlRecordItem.value.auditDate,
      auditComments: controlRecordItem.value.auditComments,
      assessor: controlRecordItem.value.assessor,
      AssessorControlStatusId: controlRecordItem.value.AssessorControlStatusId,
      assessorDate: controlRecordItem.value.assessorDate,
      assessorComments: controlRecordItem.value.assessorComments,
    };

    await $fetch("/api/control/controlRecordItems/updateItem", {
      method: "PUT",
      body,
    });
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

// Build tree structure
function buildTree(statements) {
  const map = {};
  const roots = [];

  statements.forEach((s) => (map[s.id] = { ...s, children: [] }));
  statements.forEach((s) => {
    if (s.parentId) map[s.parentId].children.push(map[s.id]);
    else roots.push(map[s.id]);
  });

  return roots;
}

// Flatten tree into lines with indentation level
function flattenTree(nodes, level = 0) {
  let lines = [];
  nodes.forEach((node) => {
    lines.push({ id: node.id, text: `${node.number} ${node.description}`, level });
    if (node.children && node.children.length) {
      lines = lines.concat(flattenTree(node.children, level + 1));
    }
  });
  return lines;
}

const tree = computed(() => buildTree(listOfItems.value[recordId.value].statements));
const formattedLines = computed(() => flattenTree(tree.value));
</script>
