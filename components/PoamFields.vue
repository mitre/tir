<template>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-8">
      <label for="PoamComments" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >POAM Comments
      </label>
      <div class="mt-2">
        <textarea
          id="PoamComments"
          v-model="item.Poam_Comments"
          rows="2"
          name="PoamComments"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-4">
      <label for="office" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Office/Org</label>
      <div class="mt-2">
        <textarea
          id="office"
          v-model="item.Office_Org"
          rows="2"
          name="office"
          class="break-word z-10 block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-4">
      <label for="Resources" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Resources Required</label
      >
      <div class="mt-2">
        <textarea
          id="Resourcese"
          v-model="item.Resources_Required"
          rows="2"
          name="Resources"
          autocomplete="family-name"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-2">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Scheduled Completion Date
      </label>
      <div class="mt-2">
        <input
          id="date"
          v-model="item.Scheduled_Completion_Date"
          required
          type="date"
          name="date"
          class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-8">
      <label for="Milestone-Date" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Milestone w/ Completion Dates</label
      >
      <div
        id="Milestone-Date"
        name="Milestone-Date"
        class="mt-2 block w-full overflow-x-auto rounded-md border-0 bg-white p-2 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white"
      >
        <div
          v-for="(milestone, index) in item.Milestones"
          :key="milestone"
          class="col-start-1 col-end-7 grid grid-cols-6"
        >
          <div class="col-span-4">
            <label
              v-show="index === 0"
              for="Milestone"
              class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
              >Milestone
            </label>
            <div class="mt-2">
              <textarea
                id="Milestone"
                v-model="milestone.item"
                rows="1"
                name="Milestone"
                class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div class="col-span-2">
            <label
              v-show="index === 0"
              for="Date"
              class="block whitespace-nowrap text-sm font-medium leading-6 text-gray-800 dark:text-white"
              >Completion Date
            </label>
            <div class="mt-2 inline-flex">
              <input
                id="Date"
                v-model="milestone.completion_date"
                required
                type="Date"
                name="Date"
                class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
              />
              <XMarkIcon
                class="ml-2 h-5 w-5 cursor-pointer self-center text-red-500 hover:text-red-200"
                @click="item.Milestones.splice(index, 1)"
              />
            </div>
          </div>
        </div>

        <div class="col-start-3 col-end-5 mt-2 text-center">
          <button
            type="button"
            class="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-500"
            @click.stop="[item.Milestones.push({ item: null, completion_date: null })]"
          >
            <PlusIcon class="h-5 w-5 rounded-md" aria-hidden="true" />
            Milestone
          </button>
        </div>
      </div>
    </div>

    <div class="col-span-4">
      <label for="MilestoneChanges" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Milestone Changes
      </label>
      <div class="mt-2">
        <textarea
          id="MilestoneChanges"
          v-model="item.Milestone_Changes"
          rows="2"
          name="MilestoneChanges"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
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
          v-model="item.Mitigations"
          rows="2"
          name="Mitigations"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-2">
      <Listbox v-model="item.Severity" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Severity</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.Severity === 'Very Low'
                    ? 'bg-green-600'
                    : item.Severity === 'Low'
                      ? 'bg-lime-400'
                      : item.Severity === 'Moderate'
                        ? 'bg-yellow-400'
                        : item.Severity === 'High'
                          ? 'bg-orange-500'
                          : item.Severity === 'Very High'
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span v-if="item.Severity != null" class="ml-3 block truncate text-gray-800 dark:text-white">{{
                item.Severity
              }}</span>
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
                v-for="level in threatLevel"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.name"
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
      <Listbox v-model="item.Relevance_of_Threat" as="div">
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
                  item.Relevance_of_Threat === 'Very Low'
                    ? 'bg-green-600'
                    : item.Relevance_of_Threat === 'Low'
                      ? 'bg-lime-400'
                      : item.Relevance_of_Threat === 'Moderate'
                        ? 'bg-yellow-400'
                        : item.Relevance_of_Threat === 'High'
                          ? 'bg-orange-500'
                          : item.Relevance_of_Threat === 'Very High'
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span v-if="item.Relevance_of_Threat != null" class="ml-3 block truncate text-gray-800 dark:text-white">{{
                item.Relevance_of_Threat
              }}</span>
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
                v-for="level in threatLevel"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.name"
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
      <Listbox v-model="item.Likelihood" as="div">
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
                  item.Likelihood === 'Very Low'
                    ? 'bg-green-600'
                    : item.Likelihood === 'Low'
                      ? 'bg-lime-400'
                      : item.Likelihood === 'Moderate'
                        ? 'bg-yellow-400'
                        : item.Likelihood === 'High'
                          ? 'bg-orange-500'
                          : item.Likelihood === 'Very High'
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span v-if="item.Likelihood != null" class="ml-3 block truncate text-gray-800 dark:text-white">{{
                item.Likelihood
              }}</span>
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
                v-for="level in threatLevel"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.name"
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
      <Listbox v-model="item.Impact" as="div">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Impact</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton
            class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
          >
            <span class="flex items-center">
              <span
                :class="[
                  item.Impact === 'Very Low'
                    ? 'bg-green-600'
                    : item.Impact === 'Low'
                      ? 'bg-lime-400'
                      : item.Impact === 'Moderate'
                        ? 'bg-yellow-400'
                        : item.Impact === 'High'
                          ? 'bg-orange-500'
                          : item.Impact === 'Very High'
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span v-if="item.Impact != null" class="ml-3 block truncate text-gray-800 dark:text-white">{{
                item.Impact
              }}</span>
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
                v-for="level in threatLevel"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.name"
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
          v-model="item.Impact_Description"
          rows="2"
          name="ImpactDesc"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="col-span-2"></div>

    <div class="col-span-2">
      <Listbox v-model="item.Residual_Risk_Level" as="div">
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
                  item.Residual_Risk_Level === 'Very Low'
                    ? 'bg-green-600'
                    : item.Residual_Risk_Level === 'Low'
                      ? 'bg-lime-400'
                      : item.Residual_Risk_Level === 'Moderate'
                        ? 'bg-yellow-400'
                        : item.Residual_Risk_Level === 'High'
                          ? 'bg-orange-500'
                          : item.Residual_Risk_Level === 'Very High'
                            ? 'bg-red-700'
                            : 'bg-white ring-1 ring-black',
                  'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                ]"
              />
              <span v-if="item.Residual_Risk_Level != null" class="ml-3 block truncate text-gray-800 dark:text-white">{{
                item.Residual_Risk_Level
              }}</span>
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
                v-for="level in threatLevel"
                :key="level.id"
                v-slot="{ active, selected }"
                as="template"
                :value="level.name"
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

    <div class="col-span-4"></div>

    <div class="col-span-4">
      <label for="recommendations" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
        >Recommendations
      </label>
      <div class="mt-2">
        <textarea
          id="recommendations"
          v-model="item.Recommendations"
          rows="2"
          name="recommendations"
          class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, PlusIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";

const props = defineProps({
  evaluationItem: {
    type: Object,
    required: true,
  },
});

const item = ref(props.evaluationItem);
watchEffect(() => {
  item.value = props.evaluationItem;
});

const threatLevel = [
  { id: 1, name: "Very Low" },
  { id: 2, name: "Low" },
  { id: 3, name: "Moderate" },
  { id: 4, name: "High" },
  { id: 5, name: "Very High" },
];
</script>
