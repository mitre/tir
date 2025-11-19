<template>
  <div class="relative inline-block">
    <h1
      class="mb-4 cursor-help text-black underline dark:text-white"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      Audit Section
    </h1>
    <Transition
      enter="transition-opacity duration-150"
      enter-from="opacity-0 translate-y-1"
      enter-to="opacity-100 translate-y-0"
      leave="transition-opacity duration-150"
      leave-from="opacity-100 translate-y-0"
      leave-to="opacity-0 translate-y-1"
    >
      <div
        v-if="showTooltip"
        class="text-s absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-white shadow-lg"
      >
        External audit information and results.
      </div>
    </Transition>
  </div>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-2">
      <label for="Auditor" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Auditor </label>
      <div class="mt-2">
        <input
          id="Auditor"
          v-model="item.auditor"
          name="Auditor"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-2">
      <Listbox v-model="item.AuditControlStatusId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Control Status</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ controlStatus.find((p) => p.id === item.AuditControlStatusId)?.name || "Not Set" }}
              </span>
            </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
            >
              <ListboxOption
                v-for="level in controlStatus"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.id"
              >
                <li
                  :class="[
                    active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-white',
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                  ]"
                >
                  <div class="flex items-center">
                    <span :class="[selected ? 'font-bold' : 'font-normal', 'ml-3 block truncate']">
                      {{ level.name }}
                    </span>
                  </div>

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
    <div class="col-span-2">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Date </label>
      <div class="mt-2">
        <input
          id="date"
          v-model="auditDate"
          required
          type="date"
          name="date"
          class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-4">
      <label for="recommendations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Comments
      </label>
      <div class="mt-2">
        <textarea
          id="recommendations"
          v-model="item.auditComments"
          rows="2"
          name="recommendations"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
  <div class="relative mt-6 inline-block">
    <h1
      class="mb-4 cursor-help text-black underline dark:text-white"
      @mouseenter="showTooltip2 = true"
      @mouseleave="showTooltip2 = false"
    >
      Assessor Section
    </h1>
    <Transition
      enter="transition-opacity duration-150"
      enter-from="opacity-0 translate-y-1"
      enter-to="opacity-100 translate-y-0"
      leave="transition-opacity duration-150"
      leave-from="opacity-100 translate-y-0"
      leave-to="opacity-0 translate-y-1"
    >
      <div
        v-if="showTooltip2"
        class="text-s absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-white shadow-lg"
      >
        Internal assessment information and results.
      </div>
    </Transition>
  </div>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-2">
      <label for="Auditor" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Assessor </label>
      <div class="mt-2">
        <input
          id="Auditor"
          v-model="item.assessor"
          name="Auditor"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-2">
      <Listbox v-model="item.AssessorControlStatusId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Control Status</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ controlStatus.find((p) => p.id === item.AssessorControlStatusId)?.name || "Not Set" }}
              </span>
            </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
            >
              <ListboxOption
                v-for="level in controlStatus"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.id"
              >
                <li
                  :class="[
                    active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-white',
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                  ]"
                >
                  <div class="flex items-center">
                    <span :class="[selected ? 'font-bold' : 'font-normal', 'ml-3 block truncate']">
                      {{ level.name }}
                    </span>
                  </div>

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
    <div class="col-span-2">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Date </label>
      <div class="mt-2">
        <input
          id="date"
          v-model="assessorDate"
          required
          type="date"
          name="date"
          class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-4">
      <label for="recommendations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Comments
      </label>
      <div class="mt-2">
        <textarea
          id="recommendations"
          v-model="item.assessorComments"
          rows="2"
          name="recommendations"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Transition } from "@headlessui/vue";

interface DropdownItem {
  id: number;
  name: string;
}

const props = defineProps({
  evaluationItem: { type: Object, required: true },
  complianceStatus: { type: Array as PropType<DropdownItem[]>, required: true },
});

const item = toRef(props, "evaluationItem");
const auditDate = useIsoDate(item, "auditDate");
const assessorDate = useIsoDate(item, "assessorDate");

const controlStatus = computed(() => props.complianceStatus);

const showTooltip = ref(false);
const showTooltip2 = ref(false);
</script>
