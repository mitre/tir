<template>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-2">
      <Listbox v-model="item.SeverityId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Severity</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.SeverityId === 1
                    ? 'bg-green-600'
                    : item.SeverityId === 2
                      ? 'bg-lime-400'
                      : item.SeverityId === 3
                        ? 'bg-yellow-400'
                        : item.SeverityId === 4
                          ? 'bg-orange-500'
                          : item.SeverityId === 5
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ threatLevel.find((p) => p.id === item.SeverityId)?.name || "Not Set" }}
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
                v-for="level in threatLevel"
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
                    <span
                      :class="[
                        level.name === 'Very Low'
                          ? 'bg-green-600'
                          : level.name === 'Low'
                            ? 'bg-lime-400'
                            : level.name === 'Moderate'
                              ? 'bg-yellow-400'
                              : level.name === 'High'
                                ? 'bg-orange-500'
                                : 'bg-red-700',
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      ]"
                      aria-hidden="true"
                    />
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
      <Listbox v-model="item.RelevanceOfThreatId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Relevance of Threat</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.RelevanceOfThreatId === 1
                    ? 'bg-green-600'
                    : item.RelevanceOfThreatId === 2
                      ? 'bg-lime-400'
                      : item.RelevanceOfThreatId === 3
                        ? 'bg-yellow-400'
                        : item.RelevanceOfThreatId === 4
                          ? 'bg-orange-500'
                          : item.RelevanceOfThreatId === 5
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ threatLevel.find((p) => p.id === item.RelevanceOfThreatId)?.name || "Not Set" }}
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
                v-for="level in threatLevel"
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
                    <span
                      :class="[
                        level.name === 'Very Low'
                          ? 'bg-green-600'
                          : level.name === 'Low'
                            ? 'bg-lime-400'
                            : level.name === 'Moderate'
                              ? 'bg-yellow-400'
                              : level.name === 'High'
                                ? 'bg-orange-500'
                                : 'bg-red-700',
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      ]"
                      aria-hidden="true"
                    />
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
      <Listbox v-model="item.LikelihoodId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Likelihood</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.LikelihoodId === 1
                    ? 'bg-green-600'
                    : item.LikelihoodId === 2
                      ? 'bg-lime-400'
                      : item.LikelihoodId === 3
                        ? 'bg-yellow-400'
                        : item.LikelihoodId === 4
                          ? 'bg-orange-500'
                          : item.LikelihoodId === 5
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ threatLevel.find((p) => p.id === item.LikelihoodId)?.name || "Not Set" }}
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
                v-for="level in threatLevel"
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
                    <span
                      :class="[
                        level.name === 'Very Low'
                          ? 'bg-green-600'
                          : level.name === 'Low'
                            ? 'bg-lime-400'
                            : level.name === 'Moderate'
                              ? 'bg-yellow-400'
                              : level.name === 'High'
                                ? 'bg-orange-500'
                                : 'bg-red-700',
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      ]"
                      aria-hidden="true"
                    />
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

    <div class="col-span-1"></div>

    <div class="col-span-2">
      <Listbox v-model="item.ImpactId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Impact</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.ImpactId === 1
                    ? 'bg-green-600'
                    : item.ImpactId === 2
                      ? 'bg-lime-400'
                      : item.ImpactId === 3
                        ? 'bg-yellow-400'
                        : item.ImpactId === 4
                          ? 'bg-orange-500'
                          : item.ImpactId === 5
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ threatLevel.find((p) => p.id === item.ImpactId)?.name || "Not Set" }}
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
                v-for="level in threatLevel"
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
                    <span
                      :class="[
                        level.name === 'Very Low'
                          ? 'bg-green-600'
                          : level.name === 'Low'
                            ? 'bg-lime-400'
                            : level.name === 'Moderate'
                              ? 'bg-yellow-400'
                              : level.name === 'High'
                                ? 'bg-orange-500'
                                : 'bg-red-700',
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      ]"
                      aria-hidden="true"
                    />
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

    <div class="col-span-4">
      <label for="ImpactDesc" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Impact Description
      </label>
      <div class="mt-2">
        <textarea
          id="ImpactDesc"
          v-model="item.impactDescription"
          rows="2"
          name="ImpactDesc"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-2"></div>

    <div class="col-span-2">
      <Listbox v-model="item.ResidualRiskLevelId" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
          Residual Risk Level</ListboxLabel
        >
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.ResidualRiskLevelId === 1
                    ? 'bg-green-600'
                    : item.ResidualRiskLevelId === 2
                      ? 'bg-lime-400'
                      : item.ResidualRiskLevelId === 3
                        ? 'bg-yellow-400'
                        : item.ResidualRiskLevelId === 4
                          ? 'bg-orange-500'
                          : item.ResidualRiskLevelId === 5
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span class="ml-3 block truncate text-gray-800 dark:text-white">
                {{ threatLevel.find((p) => p.id === item.ResidualRiskLevelId)?.name || "Not Set" }}
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
                v-for="level in threatLevel"
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
                    <span
                      :class="[
                        level.name === 'Very Low'
                          ? 'bg-green-600'
                          : level.name === 'Low'
                            ? 'bg-lime-400'
                            : level.name === 'Moderate'
                              ? 'bg-yellow-400'
                              : level.name === 'High'
                                ? 'bg-orange-500'
                                : 'bg-red-700',
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      ]"
                      aria-hidden="true"
                    />
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
    <div class="col-span-4">
      <label for="Mitigations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Vulnerability Summary
      </label>
      <div class="mt-2">
        <textarea
          id="Mitigations"
          v-model="item.vulnerabilitySummary"
          rows="2"
          name="Mitigations"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="col-span-4">
      <label for="Mitigations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Mitigations
      </label>
      <div class="mt-2">
        <textarea
          id="Mitigations"
          v-model="item.mitigations"
          rows="2"
          name="Mitigations"
          class="block w-full rounded-md border-0 bg-white py-1.5 font-normal text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-4">
      <label for="recommendations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Recommendations
      </label>
      <div class="mt-2">
        <textarea
          id="recommendations"
          v-model="item.recommendations"
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
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";

interface DropdownItem {
  id: number;
  name: string;
}

const props = defineProps({
  evaluationItem: { type: Object, required: true },
  riskLevel: { type: Array as PropType<DropdownItem[]>, required: true },
});

const item = ref(props.evaluationItem);
watchEffect(() => {
  item.value = props.evaluationItem;
});

const threatLevel = computed(() => props.riskLevel);
</script>
