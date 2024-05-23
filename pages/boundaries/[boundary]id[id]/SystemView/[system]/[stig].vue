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
                {{ route.params.system }}
              </h4>
              <h4 class="pl-4 text-base tracking-tight text-gray-800 dark:text-white">{{ route.params.stig }}</h4>
              <h5 class="text-md ml-6 tracking-tight text-gray-800 dark:text-white">
                v{{ systemStigList[stigListValue].version }}r{{ systemStigList[stigListValue].stigRelease }}
              </h5>
              <h5 class="text-md ml-6 mr-6 tracking-tight text-gray-800 dark:text-white">
                {{ systemStigList[stigListValue].stigDate }}
              </h5>
              <!-- <h5 class=" inline-flex ml-6 text-md tracking-tight text-white ">{{ getStatus(systemStigList[stigListValue].finding_status)  }}</h5> -->
              <div
                v-for="(find, index) in getStatus(systemStigList[stigListValue].finding_status)"
                :key="find"
                class="flex"
              >
                <p
                  :class="[
                    index === 0
                      ? 'text-green-500'
                      : index === 1
                        ? 'text-red-500'
                        : index === 2
                          ? 'text-sky-500'
                          : index === 3
                            ? 'text-amber-500'
                            : 'text-gray-200',
                  ]"
                >
                  {{ find }}<span v-if="index != 3" class="text-gray-800 dark:text-gray-200">/</span>
                </p>
              </div>
              <!-- <div class="flex justify-end">
                                <p class=" ml-6 text-xl text-green-500">{{getStatus(systemStigList[stigListValue].finding_status)[0]}}<span class="text-gray-200">/</span></p>
                                <p class="text-xl text-red-600">{{getStatus(systemStigList[stigListValue].finding_status)[1]}}<span class="text-gray-200">/</span></p>
                                <p class="text-xl text-gray-200">{{getStatus(systemStigList[stigListValue].finding_status)[2]}}<span class="text-gray-200">/</span></p>
                                <p class="text-xl text-gray-200">{{getStatus(systemStigList[stigListValue].finding_status)[3]}}</p>
                            </div> -->

              <!-- <div
                                class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500  lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            </div> -->
              <!-- <div class="flex">
                                <h4 class=" mt-4 text-lg tracking-tight text-white sm:text-2xl">{{ route.params.stig}}</h4>
                                <h5 class=" flex-inlinee mt-4 ml-6 text-xl tracking-tight text-white sm:text-2xl">v{{ systemStigList[stigListValue].version }}r{{ systemStigList[stigListValue].stigRelease }}</h5>
                                <h5 class=" inline-flex mt-4 ml-6 text-xl tracking-tight text-white sm:text-2xl">{{ systemStigList[stigListValue].stigDate }}</h5>
                            </div> -->
            </div>
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
                  <!-- <div
                                        class="mx-auto mt-1 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500  lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                    </div> -->
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
                        class="group flex gap-x-3 rounded-md bg-white p-2 text-sm font-semibold leading-6 text-gray-800 dark:bg-gray-800 dark:text-white"
                        @click="
                          [
                            findCheck(check.id),
                            updateVar(),
                            (editId = check.id),
                            (editFinding = check.finding_details),
                            (editComments = check.comments),
                          ]
                        "
                      >
                        <!-- :class="[team.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']"> -->
                        <!-- <span
                                                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">{{
                                                        team.initial }}</span> -->
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
                          >{{ check.StigDatum.vuln_num }}</span
                        >
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
                  {{ listOfChecks[checkData].StigDatum.vuln_num }}
                </h2>
                <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentCheckIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].StigDatum.rule_id }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <RectangleGroupIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].StigDatum.group_title }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <ShieldExclamationIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].StigDatum.severity }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentMagnifyingGlassIcon
                      class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                    {{ listOfChecks[checkData].StigDatum.class }}
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
                        :value="option"
                      >
                        <li
                          :class="[
                            active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-200',
                            'cursor-default select-none p-4 text-sm',
                          ]"
                          @click="editStatus = option.title"
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
            <div class="mt-4 max-w-5xl rounded-md bg-gray-900/5 p-4 underline-offset-2 dark:bg-gray-300/5">
              <div class="max-h-80 overflow-y-auto pr-6">
                <h1 class="text-black underline dark:text-white">Rule Title:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].StigDatum.rule_title }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Discussion:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].StigDatum.vuln_discuss }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Check Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].StigDatum.check_check_content }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Fix Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].StigDatum.fixtext }}
                </p>
              </div>

              <label for="finding" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Finding Details:
              </label>
              <div class="mt-2">
                <textarea
                  id="finding"
                  v-model="editFinding"
                  name="finding"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>
              <label for="comments" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Comments:
              </label>
              <div class="mt-2">
                <textarea
                  id="comments"
                  v-model="editComments"
                  name="comments"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>
              <div class="mt-2 flex justify-end">
                <button
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="editAssessmentApi(editData)"
                >
                  Save
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :msg="errorMsg"
      @show="showErrorNotification = false"
    />
  </div>
  <!-- :openStig="openStig" -->
</template>

<script setup>
import { FolderIcon, HomeIcon, UsersIcon } from "@heroicons/vue/24/outline";
import {
  ArrowUturnLeftIcon,
  CalendarIcon,
  CheckIcon,
  ShieldExclamationIcon,
  RectangleGroupIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useIdStorageStore } from "~~/stores/IdStorage";

const route = useRoute();
const showErrorNotification = ref(false);
const errorMsg = ref();

const store = useIdStorageStore();
const { StigId } = storeToRefs(store);
const { SystemId } = storeToRefs(store);
const { BoundaryName } = storeToRefs(store);
const { BoundaryId } = storeToRefs(store);
const { assessmentId } = storeToRefs(store);
const { selectedFilterStore } = storeToRefs(store);

const stigSystem = {
  StigId,
  SystemId,
};
let getAssessment;

const { data: checkResults } = await useFetch("/api/assessment/get", {
  method: "POST",
  body: stigSystem,
});

if (checkResults?.value.error) {
  console.log("No Assessment found.  Creating a blank one.");
  const { data: createResults } = await useFetch("/api/assessment/create", {
    method: "POST",
    body: stigSystem,
  });

  const { data: reCheckResults } = await useFetch("/api/assessment/get", {
    method: "POST",
    body: stigSystem,
  });

  getAssessment = reCheckResults;
} else {
  getAssessment = checkResults;
}

////////////// Filter Items //////////////////////

const openCount = ref(getAssessment.value.filter((o) => o.status === "Open").length);
const notAFindingCount = ref(getAssessment.value.filter((o) => o.status === "NotAFinding").length);
const notApplicableCount = ref(getAssessment.value.filter((o) => o.status === "Not_Applicable").length);
const notReviewedCount = ref(getAssessment.value.filter((o) => o.status === "Not_Reviewed").length);

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
// console.log(selectedFilter.value)
function getFilterItems() {
  if (selectedFilter.value.length === 0) {
    const fullList = getAssessment.value;
    // fullList.sort((a,b)=> a.id - b.id)
    return fullList;
  } else {
    const filteredList = getAssessment.value.filter((item) => {
      return selectedFilter.value.includes(item.status);
    });
    // filteredList.sort((a,b)=> a.id - b.id)
    return filteredList;
  }
}

function addFilter(name) {
  if (selectedFilter.value.findIndex((o) => o === name) != -1) {
    const del = selectedFilter.value.findIndex((o) => o === name);
    selectedFilter.value.splice(del, 1);
    selectedFilterStore.value = selectedFilter.value;
  } else {
    selectedFilter.value.push(name);
    selectedFilterStore.value = selectedFilter.value;
  }
}

////////////// From STIG
const currentSystem = {
  SystemId,
};
const { data: systemStigList } = await useFetch("/api/systems/stig/list", {
  method: "POST",
  body: currentSystem,
});
const listOfChecks = getAssessment.value.sort((a, b) => {
  const nameA = a.StigDatum.vuln_num.toUpperCase(); // ignore upper and lowercase
  const nameB = b.StigDatum.vuln_num.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
});
//  console.log("List of Checks", listOfChecks)

const stigListValue = systemStigList.value.findIndex((o) => o.id === StigId.value);

////////////// Check View
var checkData = ref(assessmentId.value);
var checkStatus = ref("");
var startingPosition = ref();

checkStatus = listOfChecks[checkData.value].status;
// console.log('Check Data',checkData)
function updateVar() {
  checkStatus = listOfChecks[checkData].status;
  startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
  selected = statusOptions[startingPosition];
}

function findCheck(checkId) {
  checkData = listOfChecks.findIndex((o) => o.id === checkId);
  assessmentId.value = checkData;
  // console.log("Array Position", checkData)
}
////////////// Finding Status

const statusOptions = [
  { title: "Open" },
  { title: "NotAFinding" },
  { title: "Not_Applicable" },
  { title: "Not_Reviewed" },
];

startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
var selected = ref(statusOptions[startingPosition]);
////////////// Edit API
const editId = ref(listOfChecks[assessmentId.value].id);
const editFinding = ref(listOfChecks[assessmentId.value].finding_details);
const editComments = ref(listOfChecks[assessmentId.value].comments);
const editStatus = ref(selected.title);

const editData = {
  id: editId.value,
  finding_details: editFinding.value,
  comments: editComments.value,
  status: editStatus.value,
  BoundaryId: BoundaryId.value,
};
async function editAssessmentApi(editData) {
  try {
    await $fetch("/api/assessment/updateItem", {
      method: "PUT",
      body: {
        id: editId.value,
        finding_details: editFinding.value,
        comments: editComments.value,
        status: editStatus.value,
        BoundaryId: BoundaryId.value,
      },
    });
    location.reload();
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}
////// Back Button
async function backButton() {
  await navigateTo(
    "/boundaries/" +
      route.params.boundary +
      "id" +
      route.params.id +
      "/SystemView/" +
      BoundaryName.value +
      "-" +
      route.params.system,
  );
}
///////// Finding Status

function getStatus(findingStatus) {
  // console.log('Finding Status',findingStatus)

  if (findingStatus != null) {
    var openStatus = findingStatus.filter((item) => {
      return item.status.includes("Open");
    });
    var notAFindingStatus = findingStatus.filter((item) => {
      return item.status.includes("NotAFinding");
    });
    var notApplicableStatus = findingStatus.filter((item) => {
      return item.status.includes("Not_Applicable");
    });
    var notReviewed = findingStatus.filter((item) => {
      return item.status.includes("Not_Reviewed");
    });
    if (openStatus.length === 0) {
      openStatus[0] = { status: "Open", count: "0" };
    }
    if (notAFindingStatus.length === 0) {
      notAFindingStatus[0] = { status: "NotAFinding", count: "0" };
    }
    if (notApplicableStatus.length === 0) {
      notApplicableStatus[0] = { status: "Not_Applicable", count: "0" };
    }
    if (notReviewed.length === 0) {
      notReviewed[0] = { status: "Not_Reviewed", count: "0" };
    }
    const finalStatus = [];
    finalStatus.push(
      notAFindingStatus[0].count,
      openStatus[0].count,
      notApplicableStatus[0].count,
      notReviewed[0].count,
    );
    // console.log('Final Status',finalStatus)
    return finalStatus;
  }
}
</script>
