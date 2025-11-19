<template>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-3">
      <Listbox v-model="item.ImplementationStatusId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Implementation Status</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                v-if="item.ImplementationStatusId != null"
                class="ml-3 block truncate text-gray-800 dark:text-white"
                >{{ implementationStatus.find((s) => s.id === item.ImplementationStatusId)?.name || "Not Set" }}</span
              >
              <span v-else class="ml-3 block truncate text-gray-800 dark:text-white">Not Set</span>
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
                v-for="level in implementationStatus"
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
    <div class="col-span-3">
      <Listbox v-model="item.CommonControlProviderId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Common Control Provider</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ provider.find((p) => p.id === item.CommonControlProviderId)?.name || "Not Set" }}
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
                v-for="level in provider"
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
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >System Provider</label
      >
      <div class="mt-2">
        <input
          id="systemProvider"
          v-model="item.systemProvider"
          type="text"
          rows="1"
          name="SystemProvider"
          placeholder="OrgName/System Name"
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-2">
      <Listbox v-model="item.SecurityControlDesignationId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Security Control Designation</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ designation.find((d) => d.id === item.SecurityControlDesignationId)?.name || "Not Set" }}
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
                v-for="level in designation"
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

    <div class="col-span-3">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Test Method</label
      >
      <fieldset class="mt-2">
        <div class="flex gap-6">
          <label v-for="option in options" :key="option" class="flex items-center gap-3 text-gray-800 dark:text-white">
            <input
              v-model="selectedMethods"
              type="checkbox"
              :value="option"
              class="rounded border-gray-300 checked:border-indigo-600 checked:bg-indigo-600"
            />
            {{ option }}
          </label>
        </div>
      </fieldset>
    </div>
    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >N/A Justification</label
      >
      <div class="mt-2">
        <textarea
          id="Resourcese"
          v-model="item.naJustification"
          rows="2"
          name="Resources"
          placeholder="A description for why a control is marked `Not Applicable`"
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-2">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Estimated Completion Date
      </label>
      <div class="mt-2">
        <input
          id="date"
          v-model="estimatedCompletionDate"
          required
          type="date"
          name="date"
          class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Implementation Narrative</label
      >
      <div class="mt-2">
        <textarea
          id="Resourcese"
          v-model="item.implementationNarrative"
          rows="2"
          name="Resources"
          placeholder="A narrative description for how a control is expected to be met."
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Responsible Entities</label
      >
      <div class="mt-2">
        <textarea
          id="Resourcese"
          v-model="item.responsibleEntities"
          rows="2"
          name="Resources"
          placeholder="Personnel responsible for implementing each control."
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { useIsoDate } from "~/composables/useIsoDate";

interface DropdownItem {
  id: number;
  name: string;
}

const props = defineProps({
  evaluationItem: { type: Object, required: true },
  implementationStatus: { type: Array as PropType<DropdownItem[]>, required: true },
  provider: { type: Array as PropType<DropdownItem[]>, required: true },
  designation: { type: Array as PropType<DropdownItem[]>, required: true },
  testMethods: { type: Array as PropType<DropdownItem[]>, required: true },
});

const item = ref(props.evaluationItem);

const selectedMethods = ref<string[]>([]);
watchEffect(() => {
  item.value = props.evaluationItem;

  if (item.value.TestMethodId) {
    const method = props.testMethods.find((m) => m.id === item.value.TestMethodId);
    selectedMethods.value = method ? method.name.split(", ").map((s) => s.trim()) : [];
  } else {
    selectedMethods.value = [];
  }
});

const implementationStatus = computed(() => props.implementationStatus);
const provider = computed(() => props.provider);
const designation = computed(() => props.designation);

const estimatedCompletionDate = useIsoDate(item, "estimatedCompletionDate");

const options = ["Test", "Interview", "Examine"];

watch(selectedMethods, (newVal) => {
  const sortedVal = [...newVal].sort();
  const match = props.testMethods.find((m) => {
    const parts = m.name
      .split(", ")
      .map((s) => s.trim())
      .sort();
    return JSON.stringify(parts) === JSON.stringify(sortedVal);
  });
  item.value.TestMethodId = match ? match.id : null;
});
</script>
