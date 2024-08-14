<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="$emit('showOverride', false)">
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

      <div class="fixed inset-0 z-10 max-h-screen">
        <div class="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
              class="relative transform overflow-y-auto rounded-lg bg-gray-100 p-6 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-5xl"
            >
              <div>
                <div class="border-b border-gray-200 pb-5 sm:pb-0">
                  <div class="mt-3 sm:mt-4">
                    <div class="hidden sm:block">
                      <nav class="-mb-px flex space-x-8">
                        <a
                          v-for="(tab, index) in tabs"
                          :key="tab.name"
                          :href="tab.href"
                          :class="[
                            tab.current
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-800 hover:border-gray-300 hover:text-gray-400 dark:text-white',
                            'text-md relative inline-flex whitespace-nowrap border-b-2 px-1 pb-4 pt-2 font-bold',
                          ]"
                          :aria-current="tab.current ? 'page' : undefined"
                          >{{ tab.name }}
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>

                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                    >Systems Affected</DialogTitle
                  >
                  <div class="mt-2">
                    <p class="pb-6 text-sm text-gray-800 dark:text-gray-300">Edit your systems below.</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-4 border-b border-white/20 px-4 pb-3">
                <div class="col-span-3 w-full max-w-sm self-end px-4">
                  <Popover v-slot="{ open }" class="relative">
                    <PopoverButton
                      :class="open ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white/90'"
                      class="group inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-base font-medium hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 dark:bg-gray-800 dark:hover:text-white"
                    >
                      <span>Filters</span>
                      <ChevronDownIcon
                        :class="open ? 'text-black dark:text-gray-300' : 'text-gray-800 dark:text-gray-300/70'"
                        class="ml-2 h-5 w-5 transition duration-150 ease-in-out dark:group-hover:text-gray-300/80"
                        aria-hidden="true"
                      />
                    </PopoverButton>

                    <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-1 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-1 opacity-0"
                    >
                      <PopoverPanel class="absolute z-10 mt-1 w-44 transform px-4 sm:px-0">
                        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                          <div class="relative bg-white p-4 dark:bg-gray-700">
                            <div class="mr-4 flex items-center">
                              <input
                                @click.stop="[(selectAll = !selectAll), updateCheckboxes()]"
                                id="inline-checkbox"
                                type="checkbox"
                                :checked="selectAll"
                                class="h-4 w-4 rounded border-gray-400 bg-white text-indigo-600 ring-offset-gray-600 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                              />
                              <label
                                for="inline-checkbox"
                                class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                                >Select All</label
                              >
                            </div>
                            <div class="mr-4 mt-2 flex items-center">
                              <input
                                @click="[(openFilter = !openFilter), updateCheckboxes()]"
                                id="inline-2-checkbox"
                                type="checkbox"
                                value=""
                                :checked="openFilter"
                                class="h-4 w-4 rounded border-gray-400 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                              />
                              <label
                                for="inline-2-checkbox"
                                class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                                >Open</label
                              >
                            </div>
                            <div class="mr-4 mt-2 flex items-center">
                              <input
                                @click="[(notAFindingFilter = !notAFindingFilter), updateCheckboxes()]"
                                id="inline-3-checkbox"
                                type="checkbox"
                                value=""
                                :checked="notAFindingFilter"
                                class="h-4 w-4 rounded border-gray-400 bg-gray-100 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                              />
                              <label
                                for="inline-3-checkbox"
                                class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                                >Not a Finding</label
                              >
                            </div>
                            <div class="mr-4 mt-2 flex items-center">
                              <input
                                @click="[(notApplicableFilter = !notApplicableFilter), updateCheckboxes()]"
                                id="inline-4-checkbox"
                                type="checkbox"
                                value=""
                                :checked="notApplicableFilter"
                                class="h-4 w-4 rounded border-gray-400 bg-gray-100 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                              />
                              <label
                                for="inline-4-checkbox"
                                class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                                >Not Applicable</label
                              >
                            </div>
                            <div class="mt-2 flex items-center">
                              <input
                                @click="[(notReviewedFilter = !notReviewedFilter), updateCheckboxes()]"
                                id="inline-5-checkbox"
                                type="checkbox"
                                value=""
                                :checked="notReviewedFilter"
                                class="h-4 w-4 rounded border-gray-400 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-500 focus:ring-indigo-600 dark:bg-gray-700"
                              />
                              <label
                                for="inline-5-checkbox"
                                class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                                >Not Reviewed</label
                              >
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>
                </div>

                <div class="col-span-3 col-start-5 items-center">
                  <Listbox v-model="setFindingStatus">
                    <ListboxLabel class="text-sm font-medium text-gray-800 dark:text-gray-300"
                      >Set Finding Status:
                    </ListboxLabel>
                    <div class="relative flex">
                      <ListboxButton
                        class="relative w-40 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:leading-6"
                      >
                        <span v-if="setFindingStatus" class="block truncate">{{ setFindingStatus.title }}</span>
                        <span v-else class="block truncate">{{ setFindingStatus }}</span>
                        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>

                      <transition
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-10 mt-10 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
                        >
                          <ListboxOption
                            as="template"
                            v-for="stat in status"
                            :key="stat.title"
                            :value="stat"
                            v-slot="{ active, selected }"
                          >
                            <li
                              :class="[
                                active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-300',
                                'relative cursor-default select-none py-2 pl-3 pr-9',
                              ]"
                            >
                              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{
                                stat.title
                              }}</span>

                              <span
                                v-if="selected"
                                :class="[
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                ]"
                              >
                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                      <button
                        @click="setSelectedStatus()"
                        class="ml-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Set
                      </button>
                    </div>
                  </Listbox>
                </div>

                <div class="col-span-3 col-start-9 items-center">
                  <Listbox v-model="setOverrideStatus">
                    <ListboxLabel class="text-sm font-medium text-gray-800 dark:text-gray-300"
                      >Set Override Status:
                    </ListboxLabel>
                    <div class="relative flex">
                      <ListboxButton
                        class="relative w-40 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm leading-6 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        <span v-if="setOverrideStatus" class="block truncate">{{ setOverrideStatus.title }}</span>
                        <span v-else class="block truncate">{{ setOverrideStatus }}</span>
                        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>

                      <transition
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-10 mt-10 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
                        >
                          <ListboxOption
                            as="template"
                            v-for="stat in overrideStatus"
                            :key="stat.title"
                            :value="stat"
                            v-slot="{ active, selected }"
                          >
                            <li
                              :class="[
                                active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-300',
                                'relative cursor-default select-none py-2 pl-3 pr-9',
                              ]"
                            >
                              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{
                                stat.title
                              }}</span>

                              <span
                                v-if="selected"
                                :class="[
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                ]"
                              >
                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                      <button
                        @click="setSelectedOverride()"
                        class="ml-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Set
                      </button>
                    </div>
                  </Listbox>
                </div>
              </div>

              <div class="max-h-96 overflow-y-auto">
                <Disclosure as="div" v-for="(system, index) in systemListChecks" class="mt-2">
                  <div
                    class="text-md grid h-16 grid-cols-12 items-center gap-4 rounded-lg bg-gray-200 px-4 py-2 text-left font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-gray-300/5 dark:text-white dark:hover:bg-gray-900"
                  >
                    <div class="col-span-3">
                      <input
                        @click.stop="[(system.check = !system.check)]"
                        :id="system"
                        type="checkbox"
                        :checked="system.check"
                        class="z-10 mr-4 h-4 w-4 rounded border-gray-600 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                      />
                      {{ system.Assessment.System.name }}
                    </div>

                    <div class="col-span-4 flex grid grid-cols-4 items-center gap-4">
                      <Listbox v-model="selected[index]">
                        <ListboxLabel class="col-span-1 text-sm font-medium text-gray-800 dark:text-gray-300"
                          >Current:
                        </ListboxLabel>
                        <div class="relative col-span-3 flex">
                          <ListboxButton
                            class="relative w-40 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:leading-6"
                          >
                            <span class="block truncate">{{ selected[index].title }}</span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </ListboxButton>

                          <transition
                            leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                          >
                            <ListboxOptions
                              class="fixed z-10 mt-10 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
                            >
                              <ListboxOption
                                as="template"
                                v-for="stat in status"
                                :key="stat.title"
                                :value="stat"
                                v-slot="{ active, selected }"
                              >
                                <li
                                  @click="[(systemListChecks[index].status = stat.title)]"
                                  :class="[
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-300',
                                    'relative cursor-default select-none py-2 pl-3 pr-9',
                                  ]"
                                >
                                  <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{
                                    stat.title
                                  }}</span>

                                  <span
                                    v-if="selected"
                                    :class="[
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4',
                                    ]"
                                  >
                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                  </span>
                                </li>
                              </ListboxOption>
                            </ListboxOptions>
                          </transition>
                        </div>
                      </Listbox>
                    </div>

                    <div class="col-span-4 flex grid grid-cols-4 items-center gap-4">
                      <Listbox v-model="selectedOverride[index]">
                        <ListboxLabel class="col-span-1 text-sm font-medium text-gray-800 dark:text-gray-300"
                          >Override:
                        </ListboxLabel>
                        <div class="relative col-span-3 flex">
                          <ListboxButton
                            class="relative w-40 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm leading-6 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            <span class="block truncate">{{ selectedOverride[index].title }}</span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </ListboxButton>

                          <transition
                            leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                          >
                            <ListboxOptions
                              class="fixed z-10 mt-10 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
                            >
                              <ListboxOption
                                as="template"
                                v-for="stat in overrideStatus"
                                :key="stat.title"
                                :value="stat"
                                v-slot="{ active, selected }"
                              >
                                <li
                                  @click="[newOverride(index, stat.title)]"
                                  :class="[
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-300',
                                    'relative cursor-default select-none py-2 pl-3 pr-9',
                                  ]"
                                >
                                  <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{
                                    stat.title
                                  }}</span>

                                  <span
                                    v-if="selected"
                                    :class="[
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4',
                                    ]"
                                  >
                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                  </span>
                                </li>
                              </ListboxOption>
                            </ListboxOptions>
                          </transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                </Disclosure>
              </div>

              <div class="mt-32 flex justify-end">
                <button
                  @click="[saveChanges()]"
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Save
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
      <ErrorNotification
        class="z-20"
        v-if="showErrorNotification"
        :show="showErrorNotification"
        :msg="errorMsg"
        @show="showErrorNotification = false"
      />
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Disclosure,
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/vue";

import { CheckIcon, ChevronUpDownIcon, ChevronDownIcon } from "@heroicons/vue/20/solid";
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  BoundaryId: {
    type: Number,
    required: true,
  },
  StigId: {
    type: Number,
    required: true,
  },
  StigDataId: {
    type: Number,
    required: true,
  },
});

const { open, BoundaryId, StigId, StigDataId } = props;

const tabs = [
  { name: "Systems", href: "#", current: true },
  // { name: 'Findings', href: '#', current: false },
  // { name: 'Checklist', href: '#', current: false },
];

const status = [{ title: "Open" }, { title: "NotAFinding" }, { title: "Not_Applicable" }, { title: "Not_Reviewed" }];

const overrideStatus = [
  { title: "None" },
  { title: "Open" },
  { title: "NotAFinding" },
  { title: "Not_Applicable" },
  { title: "Not_Reviewed" },
];

const selected = ref([]);
const selectedOverride = ref([]);
const selectAll = ref(false);

const openFilter = ref(false);
const notAFindingFilter = ref(false);
const notApplicableFilter = ref(false);
const notReviewedFilter = ref(false);

const setFindingStatus = ref();
const setOverrideStatus = ref();

const showErrorNotification = ref(false);
const errorMsg = ref();

/////API Call
var systemListChecks = ref([]);
const { data: systemList } = await useFetch("/api/evaluation/getSystems", {
  method: "GET",
  query: { params1: StigDataId, params2: BoundaryId },
});

for (let i = 0; i < systemList.value.AssessmentItems.length; i++) {
  selected.value.push(status.find((o) => o.title === systemList.value.AssessmentItems[i].status));
  if (systemList.value.AssessmentItems[i].Assessment.System.Overrides.length === 0) {
    selectedOverride.value.push(overrideStatus[0]);
  } else {
    selectedOverride.value.push(
      overrideStatus.find((o) => o.title === systemList.value.AssessmentItems[i].Assessment.System.Overrides[0].status),
    );
  }
  // console.log(systemList.value)
  systemListChecks.value.push(systemList.value.AssessmentItems[i]);
  // console.log(systemListChecks.value)
  systemListChecks.value[i].check = false;

  systemListChecks.value[i].newOverride = {};
}

function newOverride(index, title) {
  if (systemListChecks.value[index].Assessment.System.Overrides.length !== 0) {
    systemListChecks.value[index].Assessment.System.Overrides[0].status = title;
  } else {
    systemListChecks.value[index].newOverride = { create: true, status: title };
  }
}

async function saveChanges() {
  let error = false;
  // console.log('save changes',systemListChecks.value)
  for (let i = 0; i < systemListChecks.value.length; i++) {
    if (systemListChecks.value[i].check) {
      // console.log('This is Checked', systemListChecks.value[i].AssessmentItem.id, systemListChecks.value[i].AssessmentItem.status )
      try {
        await $fetch("/api/assessment/updateItem", {
          method: "PUT",
          body: {
            id: systemListChecks.value[i].id,
            status: systemListChecks.value[i].status,
            BoundaryId,
          },
        });
        if (systemListChecks.value[i].newOverride.create === true) {
          if (systemListChecks.value[i].newOverride.status !== "None") {
            await useFetch("/api/override/create", {
              method: "POST",
              body: {
                status: systemListChecks.value[i].newOverride.status,
                SystemId: systemListChecks.value[i].Assessment.SystemId,
                StigDatumId: systemList.value.id,
              },
            });
          }
        } else if (systemListChecks.value[i].Assessment.System.Overrides.length !== 0) {
          // console.log('Edit Override')
          if (systemListChecks.value[i].Assessment.System.Overrides[0].status === "None") {
            await useFetch("/api/override/delete", {
              method: "POST",
              body: {
                SystemId: systemListChecks.value[i].Assessment.SystemId,
                StigDatumId: systemList.value.id,
              },
            });
          } else {
            await useFetch("/api/override/edit", {
              method: "PUT",
              body: {
                id: systemListChecks.value[i].Assessment.System.Overrides[0].id,
                name: systemListChecks.value[i].Assessment.System.Overrides[0].status,
              },
            });
          }
        }
      } catch (err) {
        error = true;
        errorMsg.value = err.data.statusMessage;
        showErrorNotification.value = true;
        setTimeout(() => (showErrorNotification.value = false), 6000);
      }
    }
  }
  if (!error) {
    location.reload();
  }
}

/// Checkboxes
function updateCheckboxes() {
  for (let i = 0; i < systemListChecks.value.length; i++) {
    if (openFilter.value && systemListChecks.value[i].status === "Open") {
      systemListChecks.value[i].check = true;
    } else if (notAFindingFilter.value && systemListChecks.value[i].status === "NotAFinding") {
      systemListChecks.value[i].check = true;
    } else if (notApplicableFilter.value && systemListChecks.value[i].status === "Not_Applicable") {
      systemListChecks.value[i].check = true;
    } else if (notReviewedFilter.value && systemListChecks.value[i].status === "Not_Reviewed") {
      systemListChecks.value[i].check = true;
    } else if (selectAll.value) {
      systemListChecks.value[i].check = true;
    } else {
      systemListChecks.value[i].check = false;
    }
  }
}

function setSelectedStatus() {
  for (let i = 0; i < systemListChecks.value.length; i++) {
    if (systemListChecks.value[i].check === true) {
      systemListChecks.value[i].status = setFindingStatus.value.title;
      selected.value[i] = status.find((o) => o.title === setFindingStatus.value.title);
    }
  }
}
//Need to create Override when being changed from null before adding new override status
function setSelectedOverride() {
  for (let i = 0; i < systemListChecks.value.length; i++) {
    if (systemListChecks.value[i].check === true) {
      if (systemListChecks.value[i].Assessment.System.Overrides.length !== 0) {
        systemListChecks.value[i].Assessment.System.Overrides[0].status = setOverrideStatus.value.title;
      } else {
        systemListChecks.value[i].newOverride = { create: true, status: setOverrideStatus.value.title };
      }

      selectedOverride.value[i] = overrideStatus.find((o) => o.title === setOverrideStatus.value.title);
    }
  }
}
</script>
