<template>
  <div class="max-h-96 overflow-y-auto">
    <div v-for="(system, index) in overrides" :key="system.id" class="mt-2">
      <div class="ml-2 mt-2" as="div">
        <div
          class="text-md h-18 grid grid-cols-12 items-center gap-4 rounded-lg bg-gray-200 px-4 py-2 text-left font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-gray-300/5 dark:text-white dark:hover:bg-gray-900"
        >
          <div class="col-span-3 col-start-1">
            <input
              :id="system.id"
              type="checkbox"
              :checked="checkBoxes[index]"
              class="z-10 mr-4 h-4 w-4 rounded border-gray-600 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
              @click.stop="[(checkBoxes[index] = !checkBoxes[index])]"
            />{{ system.name }}
          </div>
          <div class="relative col-start-4 flex justify-start">
            <div class="flex-col">
              <OverrideListBox
                v-model="system.overrides[computedOverrideType]"
                :options="options"
                :absolute-label="system[overrideType]"
              />
            </div>
            <div class="ml-2 flex items-end">
              <button
                v-if="findOverrideLock(index, overrideType)"
                ref="unlockButtons"
                @click="handleLockClick(index, overrideType, null)"
              >
                <LockClosedIcon class="h-8 w-8 self-end text-gray-400" aria-hidden="true" /></button
              ><button
                ref="lockButtons"
                v-else
                @click="handleLockClick(index, overrideType, system.overrides[computedOverrideType])"
              >
                <LockOpenIcon class="h-8 w-8 self-end text-gray-400" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="col-span-6 col-start-7 ml-7 flex items-center">
            <textarea
              id="'justification'+system.id"
              v-model="system.overrides[computedOverrideJustification]"
              rows="2"
              name="computedOverrideJustification"
              class="break-word block w-[340px] rounded-md border-0 bg-white py-1 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { LockClosedIcon, LockOpenIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  overrideType: {
    type: String,
    required: true,
    default: "",
  },
  overrideClass: {
    type: String,
    required: false,
    default: "",
  },
});
const overrides = defineModel("localOverrides");
const checkBoxes = defineModel("checkBoxes");

const lockButtons = ref([]);
const unlockButtons = ref([]);

const computedOverrideType = computed(() => {
  return `${props.overrideType}Override`;
});
const computedOverrideJustification = computed(() => {
  return `${props.overrideType}OverrideJustification`;
});

function findOverrideLock(index, type) {
  const system = overrides.value[index];

  if (!system) return null;

  const lock = system.overrideLocks.find((lock) => lock.type === type);

  return lock ? lock.value : null;
}

function handleLockClick(index, type, newOverride) {
  const system = overrides.value[index];

  if (!system) return;

  const lock = system.overrideLocks.find((lock) => lock.type === type);

  if (lock) {
    lock.value = newOverride; // Update the override value
  } else {
    // Create a new lock if none exists
    const newLock = {
      id: null, // Set id to null as per the requirement
      type,
      value: newOverride,
    };
    system.overrideLocks.push(newLock); // Add the new lock to the overrideLocks array
  }
}

function triggerLocks() {
  for (let index = 0; index < overrides.value.length; index++) {
    if (checkBoxes.value[index]) {
      if (lockButtons.value[index]) {
        lockButtons.value[index].click();
      }
    }
  }
}

function triggerUnlocks() {
  unlockButtons.value.forEach((button) => {
    if (button) {
      button.click(); // Programmatically trigger each button click
    }
  });
}

function mapStigSeverity(stigSeverity) {
  const severityMap = {
    low: "CAT III",
    medium: "CAT II",
    high: "CAT I",
  };
  return severityMap[stigSeverity] || null;
}

function transformLabel(label) {
  if (props.overrideClass === "stig" && props.overrideType === "severity") {
    return mapStigSeverity(label);
  }
  return label;
}
defineExpose({ triggerLocks, triggerUnlocks });
</script>
