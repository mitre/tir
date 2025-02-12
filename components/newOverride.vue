<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10" @close="emitClose">
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
              class="relative transform overflow-y-auto rounded-lg bg-gray-100 p-6 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-5xl"
            >
              <div class="hidden sm:block">
                <div class="border-b border-gray-200">
                  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      v-for="tab in tabs"
                      :key="tab.name"
                      :class="[
                        selectedTab === tab.name
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                      ]"
                      :aria-current="selectedTab === tab.name ? 'page' : undefined"
                      @click.prevent="selectTab(tab.name)"
                    >
                      {{ tab.name }}
                    </button>
                  </nav>
                </div>
              </div>
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  @click="emitClose"
                >
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white"
                  >Systems Affected
                </DialogTitle>
                <div class="mb-6 mt-2">
                  <p class="text-sm text-gray-500">Edit our systems below.</p>
                </div>
              </div>

              <div class="grid grid-cols-12 items-center border-b border-gray-300 p-4 px-4 pb-3">
                <div class="col-start-1 flex w-full max-w-sm">
                  <OverrideFilterDropdown v-model:select-all-filter="selectAllFilter" v-model:filters="filters" />
                </div>
                <div class="justify-left col-start-3 ml-16 flex w-full max-w-sm items-center">
                  <div class="flex flex-col pl-6">
                    <div class="relative w-36">
                      <OverrideListBox v-model="selectedItem" :options="options" :label="selectedTab" />
                    </div>
                  </div>
                  <button
                    class="ml-4 mt-5 inline-flex items-center rounded-md bg-indigo-600 px-3 py-[6px] text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="setSelectedStatus"
                  >
                    Set
                  </button>
                  <button class="ml-2 mt-4" @click="triggerAllLocks">
                    <LockClosedIcon class="mt-1 h-8 w-8 self-end text-gray-400" aria-hidden="true" />
                  </button>
                </div>
                <div
                  class="col-span-5 col-start-7 ml-10 items-end text-sm font-semibold leading-6 text-gray-800 dark:text-white"
                >
                  Override Justification
                  <textarea
                    id="overrideJustification"
                    v-model="overrideJustification"
                    rows="2"
                    name="overrideJustification"
                    class="break-word block w-[340px] rounded-md border-0 bg-white py-1 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                  />
                </div>
                <div class="flex">
                  <button
                    class="ml-1 mt-5 inline-flex w-12 items-center rounded-md bg-indigo-600 px-3 py-[6px] text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="setOverrideJustification"
                  >
                    Set</button
                  ><button class="ml-2 mt-4">
                    <LockClosedIcon class="mt-1 h-8 w-8 self-end text-gray-400" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <OverrideSystemList
                ref="systemList"
                v-model:local-overrides="localOverrides"
                v-model:check-boxes="checkBoxes"
                :options="options"
                :override-type="selectedTab.toLowerCase()"
                :override-class="overrideClass"
                as="div"
              />
              <!--Close/Save Buttons-->
              <div class="sm:mt-20 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                  @click="saveOverrides"
                >
                  Save
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="emitClose"
                >
                  Cancel
                </button>
              </div>
              <div></div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { XMarkIcon, LockClosedIcon } from "@heroicons/vue/24/outline";

// const { open, overrideClass, overrides } = defineProps({
//   open: Boolean,
//   overrideClass: {
//     type: String,
//     default: "stig",
//   },
//   overrides: {
//     type: Object,
//     required: true,
//   },
// });

const props = defineProps({
  open: Boolean,
  overrideClass: {
    type: String,
    default: "stig",
  },
  overrides: {
    type: Object,
    required: true,
  },
});
const { open, overrideClass, overrides } = toRefs(props);

const localOverrides = ref(overrides.value);

watch(overrides, (newVal) => {
  localOverrides.value = newVal;
});

const selectAllFilter = ref(false);
const tabs = [
  { name: "Status", href: "#", current: true },
  { name: "Severity", href: "#", current: false },
];
const options = computed(() => {
  if (selectedTab.value === "Status") {
    return ["Open", "NotAFinding", "Not_Applicable", "Not_Reviewed"];
  }
  if (selectedTab.value === "Severity") {
    if (overrideClass.value === "stig") {
      return ["CAT I", "CAT II", "CAT III"];
    } else {
      return ["Critical", "High", "Medium", "Low", "None"];
    }
  }
});

const selectedItem = ref();
const selectedTab = ref("Status");
const checkBoxes = ref(overrides.value.map(() => false));
const systemList = ref(null);
const overrideType = ref(`${selectedTab.value.toLowerCase()}Override`);

const selectTab = (tabName) => {
  selectedTab.value = tabName;
  selectedItem.value = null;
  overrideJustification.value = null;
  Object.keys(filters.value).forEach((key) => {
    delete filters.value[key];
  });
  options.value.forEach((option) => {
    filters.value[option] = false;
  });

  checkBoxes.value = overrides.value.map(() => false);
};

const overrideJustification = ref("");

function setSelectedStatus() {
  for (const [index, system] of localOverrides.value.entries()) {
    if (checkBoxes.value[index] === true) {
      overrideType.value = `${selectedTab.value.toLowerCase()}Override`;
      system.overrides[overrideType.value] = selectedItem.value;
    }
  }
}

const filters = ref(
  options.value.reduce((acc, option) => {
    acc[option] = false;
    return acc;
  }, {}),
);

function setOverrideJustification() {
  for (const [index, system] of localOverrides.value.entries()) {
    if (checkBoxes.value[index] === true) {
      overrideType.value = `${selectedTab.value.toLowerCase()}OverrideJustification`;
      system.overrides[overrideType.value] = overrideJustification.value;
    }
  }
}

watch(filters.value, (newValue) => {
  const overrideType = `${selectedTab.value.toLowerCase()}`;
  for (const [index, system] of localOverrides.value.entries()) {
    let convertedIndex = system[overrideType];
    // if (overrideClass.value === "stig" && overrideType.value === "severity") {
    //   convertedIndex = system[overrideType];
    // }

    checkBoxes.value[index] = newValue[convertedIndex];
  }
});

function triggerAllLocks() {
  if (systemList.value) {
    systemList.value.triggerLocks();
  }
}

const emit = defineEmits(["update:open"]);

function emitClose() {
  emit("update:open", false);
}
function mapSeverity(severityLevel) {
  const severityMap = {
    None: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

  return severityMap[severityLevel] || null;
}

async function saveOverrides() {
  for (const system of localOverrides.value) {
    const body = {
      id: system.id,
      severityOverrideJustification: system.overrides.severityOverrideJustification,
      statusOverride: system.overrides.statusOverride,
      statusOverrideJustification: system.overrides.statusOverrideJustification,
    };

    if (overrideClass.value === "stig") {
      body.severityOverride = system.overrides.severityOverride;
      await $fetch("/api/override/override", {
        method: "POST",
        body,
      });
    }
    if (overrideClass.value === "nessus") {
      body.severityOverride = mapSeverity(system.overrides.severityOverride);
      await $fetch("/api/vuln/override", {
        method: "POST",
        body,
      });
    }

    for (const lock of system.overrideLocks) {
      if (lock.value) {
        const body = {
          type: lock.type,
          value: lock.value,
          systemId: system.systemId,
        };
        if (overrideClass.value === "stig") {
          body.stigDatumId = system.overrides.id;
          await $fetch("/api/override/lock", {
            method: "PUT",
            body,
          });
        }
        if (overrideClass.value === "nessus") {
          body.nessusReportItemId = system.id;
          await $fetch("/api/vuln/lock", {
            method: "PUT",
            body,
          });
        }
      } else if (lock.id) {
        if (overrideClass.value === "nessus") {
          await $fetch("/api/vuln/removeLock", {
            method: "DELETE",
            body: {
              id: system.overrideLocks[0].id,
              systemId: system.systemId,
            },
          });
        }
        if (overrideClass.value === "stig") {
          await $fetch("/api/override/removeLock", {
            method: "DELETE",
            body: {
              id: system.overrideLocks[0].id,
              systemId: system.systemId,
            },
          });
        }
      }
    }
  }
  if (overrideClass.value === "nessus") {
    refreshNuxtData("VulnDataAPI");
  }
  if (overrideClass.value === "stig") {
    refreshNuxtData("evaluationAPI");
  }
  emit("update:open", false);
}
</script>
