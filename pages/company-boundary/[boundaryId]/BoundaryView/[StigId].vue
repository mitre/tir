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
                {{ BoundaryName }}
              </h4>
              <h4 class="pl-4 text-base tracking-tight text-gray-800 dark:text-white">{{ evaluation.title }}</h4>
              <h5 class="flex-inlinee text-md ml-6 tracking-tight text-gray-800 dark:text-white">
                v{{ evaluation.version }}r{{ evaluation.stigRelease }}
              </h5>
              <h5 class="text-md ml-6 inline-flex tracking-tight text-gray-800 dark:text-white">
                {{ evaluation.stigDate }}
              </h5>
            </div>
            <div>{{ assessmentId }}</div>
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
                  <div class="text-xs font-semibold leading-6 text-gray-800 dark:text-white">Checks</div>
                  <div
                    class="mx-auto mt-1 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                  ></div>
                  <ul role="list" class="-mx-2 mt-2 max-h-96 space-y-1 overflow-hidden hover:overflow-y-auto">
                    <li v-for="check in getFilterItems()" :key="check.id">
                      <a
                        :href="'#'"
                        class="group flex items-center rounded-md bg-white p-2 text-sm font-semibold leading-6 text-gray-800 dark:bg-gray-800 dark:text-white"
                        @click="
                          [
                            findCheck(check.id),
                            (editId = check.EvaluationItems[0].id),
                            (editFinding = updateFinding(check.AssessmentItems)),
                            (editComments = updateComment(check.AssessmentItems)),
                            setFields(check),
                          ]
                        "
                      >
                        <span
                          :class="[
                            check.status === 'Open'
                              ? 'text-red-500'
                              : check.status === 'NotAFinding'
                                ? 'text-green-400'
                                : check.status === 'Not_Reviewed'
                                  ? 'text-amber-500'
                                  : check.status === 'Not_Applicable'
                                    ? 'text-sky-500'
                                    : 'text-white',
                          ]"
                        >
                          {{ check.vuln_num }}
                        </span>

                        <span
                          v-show="checkHasStatusOverride(check)"
                          :class="[
                            check.status === 'Open'
                              ? 'text-red-500'
                              : check.status === 'NotAFinding'
                                ? 'text-green-400'
                                : check.status === 'Not_Reviewed'
                                  ? 'text-amber-500'
                                  : check.status === 'Not_Applicable'
                                    ? 'text-sky-500'
                                    : 'text-white',
                            'max-h-6 text-2xl',
                          ]"
                        >
                          <ClipboardDocumentCheckIcon v-if="checkHasStatusOverride(check)" class="ml-2 h-5 w-5" />
                        </span>

                        <span
                          v-show="check.Overrides.length > 0"
                          :class="[
                            check.status === 'Open'
                              ? 'text-red-500'
                              : check.status === 'NotAFinding'
                                ? 'text-green-400'
                                : check.status === 'Not_Reviewed'
                                  ? 'text-amber-500'
                                  : check.status === 'Not_Applicable'
                                    ? 'text-sky-500'
                                    : 'text-white',
                            'max-h-6 text-2xl',
                          ]"
                        >
                          <LockClosedIcon class="h-5 w-5" />
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
                  {{ listOfChecks[assessmentId].vuln_num }}
                </h2>
                <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentCheckIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[assessmentId].rule_id }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <RectangleGroupIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[assessmentId].group_title }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <ShieldExclamationIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[assessmentId].severity }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentMagnifyingGlassIcon
                      class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                    {{ listOfChecks[assessmentId].class }}
                  </div>
                </div>
              </div>
              <Listbox v-model="selected" as="div">
                <div class="relative">
                  <div class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
                    <div
                      class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                    >
                      <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                      <p class="text-sm font-semibold">{{ selected.title }}</p>
                    </div>
                    <ListboxButton class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2">
                      <ChevronDownIcon class="h-5 w-5 text-white" aria-hidden="true" />
                    </ListboxButton>
                  </div>
                </div>
              </Listbox>
              <button
                class="ml-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                @click="showOverride = true"
              >
                Systems
              </button>
            </div>
            <div class="mt-4 max-w-5xl rounded-md bg-gray-900/5 p-4 underline-offset-2 dark:bg-gray-300/5">
              <div class="max-h-80 overflow-y-auto pr-6">
                <h1 class="text-black underline dark:text-white">Rule Title:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[assessmentId].rule_title }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Discussion:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[assessmentId].vuln_discuss }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Check Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[assessmentId].check_check_content }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Fix Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[assessmentId].fixtext }}
                </p>
              </div>

              <label for="finding" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Finding Details:
              </label>
              <div class="mt-2">
                <textarea
                  id="finding"
                  v-model="editFinding"
                  readonly
                  name="finding"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-gray-500/5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>
              <label for="comments" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Comments:
              </label>
              <div class="mb-5 mt-2">
                <textarea
                  id="comments"
                  v-model="editComments"
                  readonly
                  name="comments"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-gray-500/5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>

              <Disclosure v-slot="{ open }" :default-open="true" as="div">
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
                    <PoamFields :evaluation-item="evaluationItem" />
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
          <!-- <Override
            v-if="showOverride"
            :open="showOverride"
            :BoundaryId="Number(route.params.boundaryId)"
            :StigId="Number(route.params.StigId)"
            :StigDataId="listOfChecks[checkData].id"
            @show-override="showOverride = false"
          /> -->
          <newOverride
            as="div"
            :open="showOverride"
            :overrides="overrideData"
            override-class="stig"
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
  <!-- :openStig="openStig" -->
</template>

<script setup>
import { FolderIcon, HomeIcon, UsersIcon, ClipboardDocumentCheckIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import {
  ArrowUturnLeftIcon,
  CalendarIcon,
  CheckIcon,
  ShieldExclamationIcon,
  RectangleGroupIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useIdStorageStore } from "~~/stores/IdStorage";
import { catSeverityToStig, stigSeverityToCat } from "~/utils/stig";

const route = useRoute();
const showErrorNotification = ref(false);
const errorObject = ref();
const store = useIdStorageStore();
const { assessmentId, selectedFilterStore, BoundaryName } = storeToRefs(store);

const stigBoundary = {
  StigId: route.params.StigId,
  BoundaryId: route.params.boundaryId,
};
// let evaluation;

const { data: evaluation, error: queryError } = await useFetch("/api/evaluation/getSummary", {
  method: "GET",
  query: stigBoundary,
  key: "evaluationAPI",
});
if (queryError.value && queryError.value.statusCode === 404) {
  await useFetch("/api/evaluation/create", {
    method: "POST",
    body: stigBoundary,
  });

  refreshNuxtData("evaluationAPI");
}

// const rawOverrideData = await useFetch("/api/override/listAll", {
//   method: "GET",
//   query: {
//     boundaryId: route.params.boundaryId,
//     stigId: route.params.StigId,
//     stigDatumId: listOfChecks[checkData].id,
//   },
// });

// Filter Items
const stigDatumItems = computed(() => {
  return evaluation.value?.StigData || []; // Default to empty array if StigData is not available
});

function countByStatus(status) {
  return computed(() => stigDatumItems.value.filter((item) => item.status === status).length);
}

const openCount = countByStatus("Open");
const notAFindingCount = countByStatus("NotAFinding");
const notApplicableCount = countByStatus("Not_Applicable");
const notReviewedCount = countByStatus("Not_Reviewed");
const checkHasStatusOverride = (check) => {
  return check.AssessmentItems.some((item) => item.statusOverride);
};
const filter = [
  {
    name: "Open",
    href: "#",
    icon: HomeIcon,
    count: openCount,
    current: selectedFilterStore.value.find((o) => o === "Open"),
  },
  {
    name: "NotAFinding",
    href: "#",
    icon: UsersIcon,
    count: notAFindingCount,
    current: selectedFilterStore.value.find((o) => o === "NotAFinding"),
  },
  {
    name: "Not_Applicable",
    href: "#",
    icon: FolderIcon,
    count: notApplicableCount,
    current: selectedFilterStore.value.find((o) => o === "Not_Applicable"),
  },
  {
    name: "Not_Reviewed",
    href: "#",
    icon: CalendarIcon,
    count: notReviewedCount,
    current: selectedFilterStore.value.find((o) => o === "Not_Reviewed"),
  },
];
const selectedFilter = selectedFilterStore;

function getFilterItems() {
  if (selectedFilter.value.length === 0) {
    return stigDatumItems.value;
  } else {
    const filteredList = stigDatumItems.value.filter((item) => {
      return selectedFilter.value.includes(item.status);
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

const listOfChecks = computed(() => {
  return stigDatumItems.value.sort((a, b) => {
    const nameA = a.vuln_num.toUpperCase(); // ignore upper and lowercase
    const nameB = b.vuln_num.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
});
const evaluationItem = ref(listOfChecks.value[assessmentId.value]?.EvaluationItems?.[0] || null);

// Check View
// let checkData = ref(assessmentId.value);
const checkStatus = ref("");
const startingPosition = ref();

function findCheck(checkId) {
  assessmentId.value = listOfChecks.value.findIndex((o) => o.id === checkId);
}
// Finding Status

const statusOptions = [
  { title: "Open" },
  { title: "NotAFinding" },
  { title: "Not_Applicable" },
  { title: "Not_Reviewed" },
];

const selected = computed(() => {
  // Ensure that listOfChecks and assessmentId are available and valid
  const currentCheck = listOfChecks.value[assessmentId.value];
  if (currentCheck) {
    checkStatus.value = currentCheck.status;
    startingPosition.value = statusOptions.findIndex((o) => o.title === checkStatus.value);
    return statusOptions[startingPosition.value] || statusOptions[0]; // Default to the first option if not found
  }
  return statusOptions[0]; // Default to the first option if no check is found
});

// Back Button
async function backButton() {
  await navigateTo("/company-boundary/" + route.params.boundaryId);
}

// POAM Fields

function setFields(check) {
  evaluationItem.value = check.EvaluationItems[0];
  checkStatus.value = listOfChecks.value[assessmentId.value].status;
  startingPosition.value = statusOptions.findIndex((o) => o.title === checkStatus.value);
  selected.value = statusOptions[startingPosition.value];
}

// Edit API
const editId = ref(listOfChecks.value[assessmentId.value].EvaluationItems[0].id);
const editFinding = ref();
const editComments = ref();
let findingList = "";
let commentList = "";
const assessmentList = listOfChecks.value[assessmentId.value].AssessmentItems;
for (let i = 0; i < assessmentList.length; i++) {
  const systemName = assessmentList[i].Assessment.System?.name || assessmentList[i].Assessment.System?.nam || "unknown";

  if (assessmentList[i].finding_details === null || assessmentList[i].finding_details.length < 1) {
    findingList += systemName + ": None\n";
  } else {
    findingList += systemName + ": " + assessmentList[i].finding_details + "\n";
  }
  if (assessmentList[i].comments === null || assessmentList[i].comments.length < 1) {
    commentList += systemName + ": None\n";
  } else {
    commentList += systemName + ": " + assessmentList[i].comments + "\n";
  }
}
editFinding.value = findingList;
editComments.value = commentList;

const editStatus = ref(selected.value.title);

function updateFinding(newAssessmentList) {
  findingList = "";
  for (let i = 0; i < newAssessmentList.length; i++) {
    if (newAssessmentList[i].finding_details === null || newAssessmentList[i].finding_details.length < 1) {
      findingList += newAssessmentList[i].Assessment.System.name + ": None\n";
    } else {
      findingList += newAssessmentList[i].Assessment.System.name + ": " + newAssessmentList[i].finding_details + "\n";
    }
  }
  return findingList;
}
function updateComment(newAssessmentList) {
  commentList = "";
  for (let i = 0; i < newAssessmentList.length; i++) {
    if (newAssessmentList[i].comments === null || newAssessmentList[i].comments.length < 1) {
      commentList += newAssessmentList[i].Assessment.System.name + ": None\n";
    } else {
      commentList += newAssessmentList[i].Assessment.System.name + ": " + newAssessmentList[i].comments + "\n";
    }
  }
  return commentList;
}

async function editAssessmentApi() {
  try {
    const milestoneText = [];
    evaluationItem.value.Milestones.forEach((o) => {
      milestoneText.push(o.item);
    });
    const milestoneDate = [];
    evaluationItem.value.Milestones.forEach((o) => {
      milestoneDate.push(o.completion_date);
    });
    await $fetch("/api/evaluation/updateItem", {
      method: "PUT",
      body: {
        id: editId.value,
        BoundaryId: route.params.boundaryId,
        finding_details: editFinding.value,
        comments: editComments.value,
        status: editStatus.value,
        Office_Org: evaluationItem.value.Office_Org,
        Resources_Required: evaluationItem.value.Resources_Required,
        Scheduled_Completion_Date: evaluationItem.value.Scheduled_Completion_Date,
        Milestone: milestoneText,
        Milestone_Completion_Dte: milestoneDate,
        Milestone_Changes: evaluationItem.value.Milestone_Changes,
        Poam_Comments: evaluationItem.value.Poam_Comments,
        Mitigations: evaluationItem.value.Mitigations,
        Severity: evaluationItem.value.Severity,
        Relevance_of_Threat: evaluationItem.value.Relevance_of_Threat,
        Likelihood: evaluationItem.value.Likelihood,
        Impact: evaluationItem.value.Impact,
        Impact_Description: evaluationItem.value.Impact_Description,
        Residual_Risk_Level: evaluationItem.value.Residual_Risk_Level,
        Recommendations: evaluationItem.value.Recommendations,
      },
    });
    // location.reload();
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

const showOverride = ref(false);

const overrideData = computed(() => {
  const data = evaluation.value.StigData.find((item) => item.id === listOfChecks.value[assessmentId.value].id);
  if (!data) {
    return []; // Return an empty array if no matching item is found
  }

  return data.AssessmentItems.map((item) => {
    // Find overrides related to the current system
    const systemOverrides = data.Overrides.filter((override) => override.systemId === item.Assessment.System.id);

    // Build the system object with the necessary properties
    return {
      id: item.id,
      systemId: item.Assessment.System.id,
      name: item.Assessment.System.name,
      severity: stigSeverityToCat(item.severityOverride || data.severity), // default to StigData severity if no override
      status: item.statusOverride || item.status, // use statusOverride if available, otherwise use item status
      overrides: {
        id: data.id,
        severityOverride: stigSeverityToCat(item.severityOverride) || null,
        severityOverrideJustification: item.severityOverrideJustification,
        statusOverride: item.statusOverride,
        statusOverrideJustification: item.statusOverrideJustification,
      },
      overrideLocks: systemOverrides.map((override) => ({
        id: override.stigDatumId, // Assuming stigDatumId is used as override id
        type: override.type,
        value: override.value,
      })),
    };
  });
});
</script>
