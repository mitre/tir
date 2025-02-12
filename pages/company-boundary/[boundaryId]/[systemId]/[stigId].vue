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
                {{ system.name }}
              </h4>
              <h4 class="pl-4 text-base tracking-tight text-gray-800 dark:text-white">
                {{ systemStigList[stigListValue].title }}
              </h4>
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
                        class="group flex items-center gap-x-3 rounded-md bg-white p-2 text-sm font-semibold leading-6 text-gray-800 dark:bg-gray-800 dark:text-white"
                        @click="
                          [
                            findCheck(check.id),
                            updateVar(),
                            (editId = check.id),
                            (editFinding = check.finding_details),
                            (editComments = check.comments),
                            (editJustification = check.severity_justification),
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
                            'flex items-center',
                          ]"
                          >{{ check.StigDatum.vuln_num }}
                          <DocumentArrowDownIcon v-show="check.severity_override" class="ml-2 h-5 w-5"
                        /></span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </aside>
          <main class="flex-auto px-4 px-6 lg:px-0">
            <!-- CHECK INFO BOX -->
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-800 dark:text-white">
                  {{ listOfChecks[checkData].StigDatum.vuln_num }}
                </h2>
                <div class="mt-1 flex flex-col justify-start gap-x-4 sm:mt-0 sm:flex-row sm:flex-wrap">
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
              <div>
                <div class="flex items-center justify-between pb-2">
                  <p class="text-md dark:text-white">Severity:</p>
                  <Listbox v-model="severity" as="div">
                    <div class="relative">
                      <div class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
                        <div
                          class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                        >
                          <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                          <p class="text-sm font-semibold">{{ severity.title }}</p>
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
                            v-for="option in catOptions"
                            v-slot="{ active, selected }"
                            :key="option.title"
                            as="template"
                            :value="option"
                          >
                            <li
                              :class="[
                                active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-200',
                                'cursor-default select-none p-4 text-sm',
                              ]"
                              @click="[checkSeverity(option.title)]"
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
                <div class="flex items-center justify-between">
                  <p class="mr-4 dark:text-white">Finding Status:</p>
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
              </div>
            </div>
            <TransitionRoot appear :show="isOpen" as="template">
              <Dialog as="div" class="relative z-10" @close="closeModal">
                <TransitionChild
                  as="template"
                  enter="duration-300 ease-out"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="duration-200 ease-in"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="fixed inset-0 bg-black/25 dark:bg-white/30" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                  <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild
                      as="template"
                      enter="duration-300 ease-out"
                      enter-from="opacity-0 scale-95"
                      enter-to="opacity-100 scale-100"
                      leave="duration-200 ease-in"
                      leave-from="opacity-100 scale-100"
                      leave-to="opacity-0 scale-95"
                    >
                      <DialogPanel
                        class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
                      >
                        <DialogTitle
                          as="h3"
                          class="flex items-center text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          <p>Severity Override Justification:</p>
                          <p class="text-md ml-2 rounded-lg bg-blue-500/20 px-2 py-1 dark:bg-blue-500/50">
                            {{ severity.title }}
                          </p>
                        </DialogTitle>
                        <div class="mt-2">
                          <textarea
                            id="severity_justification"
                            v-model="editJustification"
                            name="severity_justification"
                            rows="3"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-500/25 dark:text-gray-300 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div class="mt-4 flex gap-4">
                          <button
                            type="button"
                            class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            @click="
                              [(editJustification = listOfChecks[assessmentId].severity_justification), closeModal()]
                            "
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            @click="[(editSeverity = severity.title), closeModal()]"
                          >
                            Save
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </TransitionRoot>
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
              <label
                v-show="editJustification"
                for="severity_justification"
                class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Severity Justification:
              </label>
              <div v-show="editJustification" class="mt-2">
                <textarea
                  id="severity_justification"
                  v-model="editJustification"
                  name="severity_justification"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-500/25 dark:text-gray-300 sm:text-sm sm:leading-6"
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
      :error="errorObject"
      @show="showErrorNotification = false"
    />
  </div>
  <!-- :openStig="openStig" -->
</template>

<script setup>
import { FolderIcon, HomeIcon, UsersIcon } from "@heroicons/vue/24/outline";
import { DocumentArrowDownIcon } from "@heroicons/vue/20/solid";
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
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useIdStorageStore } from "~~/stores/IdStorage";

const route = useRoute();
const showErrorNotification = ref(false);
const errorObject = ref();

const store = useIdStorageStore();
const { StigId } = storeToRefs(store);
const { SystemId } = storeToRefs(store);
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

const { data: systems } = await useFetch("/api/systems/list", {
  method: "POST",
  body: { boundary: route.params.boundaryId },
});
const system = systems.value.find((o) => o.id === parseInt(route.params.systemId));

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

/// /////////// Check View
let checkData = ref(assessmentId.value);
let checkStatus = ref("");
let startingPosition = ref();
let startingCatPosition = ref();

checkStatus = listOfChecks[checkData.value].status;
// console.log('Check Data',checkData)
function updateVar() {
  checkStatus = listOfChecks[checkData].status;
  startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
  currentSeverity.value = listOfChecks[checkData].StigDatum.severity;
  selected = statusOptions[startingPosition];

  if (listOfChecks[checkData].severity_override) {
    currentOverrideSeverity.value = listOfChecks[checkData].severity_override;
  } else {
    currentOverrideSeverity.value = null;
  }

  if (currentOverrideSeverity.value) {
    startingCatPosition.value = catOptions.findIndex((o) => o.title === currentOverrideSeverity.value);
  } else {
    startingCatPosition.value = catOptions.findIndex((o) => o.title === severityMap.get(currentSeverity.value));
  }

  severity = catOptions[startingCatPosition.value];
}

function findCheck(checkId) {
  checkData = listOfChecks.findIndex((o) => o.id === checkId);
  assessmentId.value = checkData;
  // console.log("Array Position", checkData)
}
/// /////////// Finding Status

const statusOptions = [
  { title: "Open" },
  { title: "NotAFinding" },
  { title: "Not_Applicable" },
  { title: "Not_Reviewed" },
];
const catOptions = [{ title: "CAT I" }, { title: "CAT II" }, { title: "CAT III" }];

const severityMap = new Map();
severityMap.set("low", "CAT III");
severityMap.set("medium", "CAT II");
severityMap.set("high", "CAT I");

startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
let selected = ref(statusOptions[startingPosition]);

const currentSeverity = ref(listOfChecks[checkData.value].StigDatum.severity);
const currentOverrideSeverity = ref();
if (listOfChecks[checkData.value].severity_override) {
  currentOverrideSeverity.value = listOfChecks[checkData.value].severity_override;
} else {
  currentOverrideSeverity.value = null;
}

if (currentOverrideSeverity.value) {
  startingCatPosition.value = catOptions.findIndex((o) => o.title === currentOverrideSeverity.value);
} else {
  startingCatPosition.value = catOptions.findIndex((o) => o.title === severityMap.get(currentSeverity.value));
}

let severity = ref(catOptions[startingCatPosition.value]);

/// /////////// Edit API
const editId = ref(listOfChecks[assessmentId.value].id);
const editFinding = ref(listOfChecks[assessmentId.value].finding_details);
const editComments = ref(listOfChecks[assessmentId.value].comments);
const editJustification = ref(listOfChecks[assessmentId.value].severity_justification);
const editStatus = ref(selected.title);
const editSeverity = ref(severity.title);

const editData = {
  id: editId.value,
  finding_details: editFinding.value,
  comments: editComments.value,
  status: editStatus.value,
  severity_override: editSeverity.value,
  severity_justification: editJustification.value,
  BoundaryId: route.params.boundaryId,
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
        severity_override: editSeverity.value,
        severity_justification: editJustification.value,
        BoundaryId: route.params.boundaryId,
      },
    });
    location.reload();
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}
/// /// Back Button
async function backButton() {
  await navigateTo("/company-boundary/" + route.params.boundaryId + "/" + route.params.systemId);
}
/// ////// Finding Status

function getStatus(findingStatus) {
  // console.log('Finding Status',findingStatus)

  if (findingStatus != null) {
    const openStatus = findingStatus.filter((item) => {
      return item.status.includes("Open");
    });
    const notAFindingStatus = findingStatus.filter((item) => {
      return item.status.includes("NotAFinding");
    });
    const notApplicableStatus = findingStatus.filter((item) => {
      return item.status.includes("Not_Applicable");
    });
    const notReviewed = findingStatus.filter((item) => {
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

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}
function checkSeverity(title) {
  if (title !== catOptions.find((o) => o.title === severityMap.get(currentSeverity.value)).title) {
    openModal();
  } else {
    editSeverity.value = null;
    editJustification.value = null;
  }
}
</script>
