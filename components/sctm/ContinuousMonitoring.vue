<template>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-2">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Criticality</label
      >
      <div class="mt-2">
        <textarea
          id="criticality"
          v-model="item.criticality"
          type="text"
          rows="3"
          name="criticality"
          placeholder=""
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-2">
      <Listbox v-model="item.FrequencyTypeId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Frequency</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ frequency.find((p) => p.id === item.FrequencyTypeId)?.name || "Not Set" }}
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
                v-for="level in frequency"
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
      <Listbox v-model="item.ConMonMethodId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Method</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ method.find((s) => s.id === item.ConMonMethodId)?.name || "Not Set" }}</span
              >
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
                v-for="level in method"
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
    <div class="col-span-1" />
    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Reporting</label>
      <div class="mt-2">
        <textarea
          id="Reporting"
          v-model="item.reporting"
          type="text"
          rows="3"
          name="Reporting"
          placeholder="Provide a short narrative explaining who reports what to whom by when."
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-3">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Tracking</label>
      <div class="mt-2">
        <textarea
          id="Tracking"
          v-model="item.tracking"
          rows="3"
          name="Tracking"
          placeholder="Provide a short narrative explaining how security controls found to be non-compliant or ineffective will be tracked."
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >ConMon Comments</label
      >
      <div class="mt-2">
        <textarea
          id="Comments"
          v-model="item.conmonComments"
          rows="3"
          name="Comments"
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";

interface DropdownItem {
  id: number;
  name: string;
}

const props = defineProps({
  evaluationItem: { type: Object, required: true },
  frequencyTypes: { type: Array as PropType<DropdownItem[]>, required: true },
  conmonMethods: { type: Array as PropType<DropdownItem[]>, required: true },
});

const item = ref(props.evaluationItem);
watchEffect(() => {
  item.value = props.evaluationItem;
});

const frequency = computed(() => props.frequencyTypes);
const method = computed(() => props.conmonMethods);
</script>
