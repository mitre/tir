<template>
  <Listbox v-model="selectedItem">
    <ListboxLabel v-if="absoluteLabel" class="text-sm font-medium text-gray-800 dark:text-gray-300">
      {{ absoluteLabel }}
    </ListboxLabel>
    <ListboxLabel v-else-if="label" class="text-sm font-medium text-gray-800 dark:text-gray-300">
      Select {{ label }}
    </ListboxLabel>
    <div class="relative">
      <ListboxButton
        class="relative left-0 w-36 cursor-default rounded-md bg-white py-1.5 pl-3 pr-6 text-left text-sm text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300"
      >
        <span v-if="selectedItem" :class="[getStatusColor(selectedItem), 'block truncate']">
          {{ selectedItem }}
        </span>
        <span v-else class="block truncate"> Select {{ label }} </span>
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
          class="absolute left-0 z-50 mt-1 max-h-60 w-36 overflow-auto rounded-md bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
        >
          <ListboxOption v-for="option in options" :key="option" v-slot="{ active, selected }" :value="option">
            <li
              :class="[
                active ? 'bg-indigo-600 text-white' : getStatusColor(option),

                'relative cursor-default select-none py-2 pl-3 pr-9',
              ]"
            >
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ option }}</span>
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
</template>

<script setup>
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/vue/24/solid";
const selectedItem = defineModel();

defineProps({
  label: {
    type: String,
    required: false,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  absoluteLabel: {
    type: String,
    required: false,
    default: null,
  },
});

const statusColorMap = {
  Open: "text-status-open",
  NotAFinding: "text-status-notafinding",
  Not_Reviewed: "text-status-not_reviewed",
  Not_Applicable: "text-status-not_applicable",
};

const getStatusColor = (status) => statusColorMap[status] || "text-status-default";
</script>
