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
                {{ BoundaryName }}
              </h4>
              <h4 class="pl-4 text-base tracking-tight text-gray-800 dark:text-white">{{ StigName }}</h4>
              <h5 class="flex-inlinee text-md ml-6 tracking-tight text-gray-800 dark:text-white">{{ Version }}</h5>
              <h5 class="text-md ml-6 inline-flex tracking-tight text-gray-800 dark:text-white">{{ StigDate }}</h5>
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
                        class="group flex gap-x-3 rounded-md bg-white p-2 text-sm font-semibold leading-6 text-gray-800 dark:bg-gray-800 dark:text-white"
                        @click="
                          [
                            findCheck(check.id),
                            updateVar(),
                            (editId = check.EvaluationItems[0].id),
                            (editFinding = updateFinding(check.AssessmentItems)),
                            (editComments = updateComment(check.AssessmentItems)),
                            setFields(check),
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
                          ]"
                        >
                          {{ check.vuln_num }}
                        </span>
                        <span
                          v-show="check.Overrides.length > 0"
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
                            'max-h-6 text-2xl',
                          ]"
                        >
                          *
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </aside>
          <main class="flex-auto px-4 px-6 lg:px-0">
            <!-- CHECK INFO BOX -->
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-800 dark:text-white">
                  {{ listOfChecks[checkData].vuln_num }}
                </h2>
                <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentCheckIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].rule_id }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <RectangleGroupIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].group_title }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <ShieldExclamationIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true" />
                    {{ listOfChecks[checkData].severity }}
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-800 dark:text-gray-300">
                    <DocumentMagnifyingGlassIcon
                      class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                    {{ listOfChecks[checkData].class }}
                  </div>
                </div>
              </div>
              <Listbox v-model="selected" as="div">
                <div class="relative">
                  <div class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
                    <div
                      class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                    >
                      <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                      <p class="text-sm font-semibold">{{ selected.title }}</p>
                    </div>
                    <ListboxButton class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2">
                      <ChevronDownIcon class="h-5 w-5 text-white" aria-hidden="true" />
                    </ListboxButton>
                  </div>
                  <!-- Commenting out drop down for now to only display current finding status. -->
                  <!-- CLass items for button above: -->
                  <!-- hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50 -->
                  <!-- <transition leave-active-class="transition ease-in duration-100"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute right-0 z-10 mt-2 w-60 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <ListboxOption v-for="option in statusOptions" :key="option.title"
                                                v-slot="{ active, selected }" as="template" :value="option">
                                                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-gray-200', 'cursor-default select-none p-4 text-sm']"
                                                    @click="editStatus = option.title">
                                                    <div class="flex flex-col">
                                                        <div class="flex justify-between">
                                                            <p :class="selected ? 'font-semibold' : 'font-normal'">{{
                                                                option.title }}</p>
                                                            <span v-if="selected"
                                                                :class="active ? 'text-white' : 'text-indigo-600'">
                                                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition> -->
                </div>
              </Listbox>
              <button
                class="ml-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                @click="showOverride = true"
              >
                Systems
              </button>
            </div>
            <div class="mt-4 max-w-5xl rounded-md bg-gray-900/5 p-4 underline-offset-2 dark:bg-gray-300/5">
              <div class="max-h-80 overflow-y-auto pr-6">
                <h1 class="text-black underline dark:text-white">Rule Title:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].rule_title }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Discussion:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].vuln_discuss }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Check Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].check_check_content }}
                </p>

                <h1 class="text-md text-black underline dark:text-white">Fix Text:</h1>
                <p class="break-word whitespace-pre-line pb-4 text-sm text-gray-800 dark:text-gray-300">
                  {{ listOfChecks[checkData].fixtext }}
                </p>
              </div>

              <label for="finding" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Finding Details:
              </label>
              <div class="mt-2">
                <textarea
                  id="finding"
                  v-model="editFinding"
                  readonly
                  name="finding"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-gray-500/5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>
              <label for="comments" class="text-md mt-5 block leading-6 text-black underline dark:text-white"
                >Comments:
              </label>
              <div class="mb-5 mt-2">
                <textarea
                  id="comments"
                  v-model="editComments"
                  readonly
                  name="comments"
                  rows="3"
                  class="block w-full rounded-md border-0 bg-gray-500/5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6"
                />
              </div>

              <Disclosure v-slot="{ open }" :default-open="true">
                <DisclosureButton
                  :class="[
                    open ? 'bg-gray-300 dark:bg-gray-900' : 'rounded-b-lg bg-gray-900/10 dark:bg-gray-300/5',
                    'flex h-16 w-full items-center justify-between rounded-t-lg  px-4 py-2 text-left text-lg font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500  focus-visible:ring-opacity-75 dark:text-white dark:hover:bg-gray-900',
                  ]"
                >
                  POAM Fields
                  <ChevronRightIcon :class="[open && 'rotate-90 transform', 'h-6 w-6']" />
                </DisclosureButton>
                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-out"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <DisclosurePanel
                    class="h-84 text-md w-full rounded-b-lg bg-gray-300/5 px-4 py-4 text-left font-medium text-white focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
                  >
                    <div class="grid grid-cols-8 gap-x-6 gap-y-8">
                      <div class="col-span-8">
                        <label
                          for="PoamComments"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >POAM Comments
                        </label>
                        <div class="mt-2">
                          <textarea
                            id="PoamComments"
                            v-model="editPoamComments"
                            rows="2"
                            name="PoamComments"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div class="col-span-4">
                        <label for="office" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Office/Org</label
                        >
                        <div class="mt-2">
                          <textarea
                            id="office"
                            v-model="editOffice"
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
                            v-model="editResources"
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
                            v-model="editScheduledCompletionDate"
                            required
                            type="date"
                            name="date"
                            class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div class="col-span-8">
                        <label
                          for="Milestone-Date"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Milestone w/ Completion Dates</label
                        >
                        <div
                          id="Milestone-Date"
                          name="Milestone-Date"
                          class="mt-2 block w-full overflow-x-auto rounded-md border-0 bg-white p-2 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white"
                        >
                          <div
                            v-for="(milestone, index) in milestones"
                            :key="milestone.id"
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
                                  v-model="milestone.milestone"
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
                                  v-model="milestone.date"
                                  required
                                  type="Date"
                                  name="Date"
                                  class="break-word z-10 block w-full cursor-pointer rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                                />
                                <XMarkIcon
                                  class="ml-2 h-5 w-5 cursor-pointer self-center text-red-500 hover:text-red-200"
                                  @click="milestones.splice(index, 1)"
                                />
                              </div>
                            </div>
                          </div>

                          <div class="col-start-3 col-end-5 mt-2 text-center">
                            <button
                              type="button"
                              class="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-500"
                              @click.stop="[milestones.push({ milestone: null, date: null })]"
                            >
                              <PlusIcon class="h-5 w-5 rounded-md" aria-hidden="true" />
                              Milestone
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="col-span-4">
                        <label
                          for="MilestoneChanges"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Milestone Changes
                        </label>
                        <div class="mt-2">
                          <textarea
                            id="MilestoneChanges"
                            v-model="editMilestoneChanges"
                            rows="2"
                            name="MilestoneChanges"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div class="col-span-4">
                        <label
                          for="Mitigations"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Mitigations
                        </label>
                        <div class="mt-2">
                          <textarea
                            id="Mitigations"
                            v-model="editMitigations"
                            rows="2"
                            name="Mitigations"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div class="col-span-2">
                        <Listbox v-model="severity" as="div">
                          <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
                            Severity</ListboxLabel
                          >
                          <div class="relative mt-2">
                            <ListboxButton
                              class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
                            >
                              <span class="flex items-center">
                                <span
                                  :aria-label="severity.online ? 'Online' : 'Offline'"
                                  :class="[
                                    severity.name === 'Very Low'
                                      ? 'bg-green-600'
                                      : severity.name === 'Low'
                                        ? 'bg-lime-400'
                                        : severity.name === 'Moderate'
                                          ? 'bg-yellow-400'
                                          : severity.name === 'High'
                                            ? 'bg-orange-500'
                                            : 'bg-red-700',
                                    'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                                  ]"
                                />
                                <span class="ml-3 block truncate text-gray-800 dark:text-white">{{
                                  severity.name
                                }}</span>
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
                                  :value="level"
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
                                        <span class="sr-only"> is {{ level.online ? "online" : "offline" }}</span>
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
                        <Listbox v-model="relevance" as="div">
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
                                    relevance.name === 'Very Low'
                                      ? 'bg-green-600'
                                      : relevance.name === 'Low'
                                        ? 'bg-lime-400'
                                        : relevance.name === 'Moderate'
                                          ? 'bg-yellow-400'
                                          : relevance.name === 'High'
                                            ? 'bg-orange-500'
                                            : 'bg-red-700',
                                    'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                                  ]"
                                />
                                <span class="ml-3 block truncate text-gray-800 dark:text-white">{{
                                  relevance.name
                                }}</span>
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
                                  :value="level"
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
                                        <span class="sr-only"> is {{ level.online ? "online" : "offline" }}</span>
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
                        <Listbox v-model="likelihood" as="div">
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
                                    likelihood.name === 'Very Low'
                                      ? 'bg-green-600'
                                      : likelihood.name === 'Low'
                                        ? 'bg-lime-400'
                                        : likelihood.name === 'Moderate'
                                          ? 'bg-yellow-400'
                                          : likelihood.name === 'High'
                                            ? 'bg-orange-500'
                                            : 'bg-red-700',
                                    'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                                  ]"
                                />
                                <span class="ml-3 block truncate text-gray-800 dark:text-white">{{
                                  likelihood.name
                                }}</span>
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
                                  :value="level"
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
                                        <span class="sr-only"> is {{ level.online ? "online" : "offline" }}</span>
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
                        <Listbox v-model="impact" as="div">
                          <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">
                            Impact</ListboxLabel
                          >
                          <div class="relative mt-2">
                            <ListboxButton
                              class="text-gray-white relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
                            >
                              <span class="flex items-center">
                                <span
                                  :class="[
                                    impact.name === 'Very Low'
                                      ? 'bg-green-600'
                                      : impact.name === 'Low'
                                        ? 'bg-lime-400'
                                        : impact.name === 'Moderate'
                                          ? 'bg-yellow-400'
                                          : impact.name === 'High'
                                            ? 'bg-orange-500'
                                            : 'bg-red-700',
                                    'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                                  ]"
                                />
                                <span class="ml-3 block truncate text-gray-800 dark:text-white">{{ impact.name }}</span>
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
                                  :value="level"
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
                                        <span class="sr-only"> is {{ level.online ? "online" : "offline" }}</span>
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
                        <label
                          for="ImpactDesc"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Impact Description
                        </label>
                        <div class="mt-2">
                          <textarea
                            id="ImpactDesc"
                            v-model="editImpactDesc"
                            rows="2"
                            name="ImpactDesc"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div class="col-span-2"></div>

                      <div class="col-span-2">
                        <Listbox v-model="risk" as="div">
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
                                    risk.name === 'Very Low'
                                      ? 'bg-green-600'
                                      : risk.name === 'Low'
                                        ? 'bg-lime-400'
                                        : risk.name === 'Moderate'
                                          ? 'bg-yellow-400'
                                          : risk.name === 'High'
                                            ? 'bg-orange-500'
                                            : 'bg-red-700',
                                    'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                                  ]"
                                />
                                <span class="ml-3 block truncate text-gray-800 dark:text-white">{{ risk.name }}</span>
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
                                  :value="level"
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
                                        <span class="sr-only"> is {{ level.online ? "online" : "offline" }}</span>
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
                        <label
                          for="recommendations"
                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                          >Recommendations
                        </label>
                        <div class="mt-2">
                          <textarea
                            id="recommendations"
                            v-model="editRecommendations"
                            rows="2"
                            name="recommendations"
                            class="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </DisclosurePanel>
                </transition>
              </Disclosure>

              <div class="mt-4 flex justify-end">
                <button
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="editAssessmentApi()"
                >
                  Save
                </button>
              </div>
            </div>
          </main>
          <Override
            v-if="showOverride"
            :open="showOverride"
            :BoundaryId="Number(route.params.enclave)"
            :StigId="Number(route.params.StigId)"
            :StigDataId="listOfChecks[checkData].id"
            @show-override="showOverride = false"
          />
          <ErrorNotification
            v-if="showErrorNotification"
            :show="showErrorNotification"
            :msg="errorMsg"
            @show="showErrorNotification = false"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- :openStig="openStig" -->
</template>

<script setup>
import { FolderIcon, HomeIcon, UsersIcon } from "@heroicons/vue/24/outline";
import {
  ArrowUturnLeftIcon,
  CalendarIcon,
  CheckIcon,
  ShieldExclamationIcon,
  RectangleGroupIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/vue/20/solid";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { useIdStorageStore } from "~~/stores/IdStorage";
import { useEvaluationDataStore } from "~~/stores/EvaluationData";
const route = useRoute();
const showErrorNotification = ref(false);
const errorMsg = ref();
const store = useIdStorageStore();
const { StigId } = storeToRefs(store);
const { SystemId } = storeToRefs(store);
const { assessmentId } = storeToRefs(store);
const { selectedFilterStore } = storeToRefs(store);

const tempStore = useEvaluationDataStore();
const { BoundaryName, StigName, Version, StigDate } = storeToRefs(tempStore);

const stigBoundary = {
  StigId: route.params.StigId,
  BoundaryId: route.params.enclave,
};
let evaluation;

const { data: checkResults, error: queryError } = await useFetch("/api/evaluation/getSummary", {
  method: "GET",
  query: stigBoundary,
});
// console.log('checkResults',checkResults)
if (queryError.value && queryError.value.statusCode === 404) {
  const { data: createResults } = await useFetch("/api/evaluation/create", {
    method: "POST",
    body: stigBoundary,
  });

  const { data: reCheckResults } = await useFetch("/api/evaluation/getSummary", {
    method: "GET",
    query: stigBoundary,
  });

  evaluation = reCheckResults.value[0];
} else {
  evaluation = checkResults.value[0];
}

// console.log("Asses",getAssessment)

/// /////////// Filter Items //////////////////////
// const evaluationItems = evaluation.value[0].EvaluationItems;
const stigDatumItems = evaluation.StigData;

const openCount = ref(stigDatumItems.filter((o) => o.status === "Open").length);
const notAFindingCount = ref(stigDatumItems.filter((o) => o.status === "NotAFinding").length);
const notApplicableCount = ref(stigDatumItems.filter((o) => o.status === "Not_Applicable").length);
const notReviewedCount = ref(stigDatumItems.filter((o) => o.status === "Not_Reviewed").length);

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

function getFilterItems() {
  if (selectedFilter.value.length === 0) {
    return stigDatumItems;
  } else {
    const filteredList = stigDatumItems.filter((item) => {
      return selectedFilter.value.includes(item.status);
    });
    // filteredList.sort((a,b)=> a.id - b.id)
    return filteredList;
  }
}

function addFilter(name) {
  if (selectedFilter.value.findIndex((o) => o === name) !== -1) {
    const del = selectedFilter.value.findIndex((o) => o === name);
    selectedFilter.value.splice(del, 1);
    selectedFilterStore.value = selectedFilter.value;
  } else {
    selectedFilter.value.push(name);
    selectedFilterStore.value = selectedFilter.value;
  }
}

/// /////////// From STIG
// const currentSystem = {
//   "SystemId": SystemId
// }
// const { data: systemStigList } = await useFetch("/api/systems/stig/list", {
//     method: 'POST',
//     body: currentSystem
// }
// );
const listOfChecks = stigDatumItems.sort((a, b) => {
  const nameA = a.vuln_num.toUpperCase(); // ignore upper and lowercase
  const nameB = b.vuln_num.toUpperCase(); // ignore upper and lowercase
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

// const stigListValue = systemStigList.value.findIndex(o => o.id === StigId.value)

/// /////////// Check View
let checkData = ref(assessmentId.value);
let checkStatus = ref("");
let startingPosition = ref();

checkStatus = listOfChecks[checkData.value].status;
// console.log("Check Data", checkData, listOfChecks);
function updateVar() {
  checkStatus = listOfChecks[checkData].status;
  startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
  selected = statusOptions[startingPosition];

  if (listOfChecks[assessmentId.value].EvaluationItems[0].Severity != null) {
    severityStart = threatLevel.findIndex(
      (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Severity,
    );
  } else {
    severityStart = 0;
  }
  severity = ref(threatLevel[severityStart]);

  if (listOfChecks[assessmentId.value].EvaluationItems[0].Relevance_of_Threat != null) {
    relevanceStart = threatLevel.findIndex(
      (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Relevance_of_Threat,
    );
  } else {
    relevanceStart = 0;
  }
  relevance = ref(threatLevel[relevanceStart]);

  if (listOfChecks[assessmentId.value].EvaluationItems[0].Likelihood != null) {
    likelihoodStart = threatLevel.findIndex(
      (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Likelihood,
    );
  } else {
    likelihoodStart = 0;
  }
  likelihood = ref(threatLevel[likelihoodStart]);

  if (listOfChecks[assessmentId.value].EvaluationItems[0].Impact != null) {
    impactStart = threatLevel.findIndex((o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Impact);
  } else {
    impactStart = 0;
  }
  impact = ref(threatLevel[impactStart]);

  if (listOfChecks[assessmentId.value].EvaluationItems[0].Residual_Risk_Level != null) {
    riskStart = threatLevel.findIndex(
      (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Residual_Risk_Level,
    );
  } else {
    riskStart = 0;
  }
  risk = ref(threatLevel[riskStart]);
}

function findCheck(checkId) {
  checkData = listOfChecks.findIndex((o) => o.id === checkId);
  assessmentId.value = checkData;
}
/// /////////// Finding Status

const statusOptions = [
  { title: "Open" },
  { title: "NotAFinding" },
  { title: "Not_Applicable" },
  { title: "Not_Reviewed" },
];

startingPosition = statusOptions.findIndex((o) => o.title === checkStatus);
let selected = ref(statusOptions[startingPosition]);
// console.log(startingPosition);
/// /// Back Button
async function backButton() {
  await navigateTo(
    "/boundaries/" +
      route.params.boundary +
      "id" +
      route.params.id +
      "/" +
      BoundaryName.value +
      "/BoundaryView" +
      "-" +
      route.params.enclave,
  );
}

/// // Poam Fields
// var milestoneId = ref(0)
let milestones = ref([]);
if (listOfChecks[assessmentId.value].EvaluationItems[0].Milestones.length !== 0) {
  // console.log('Mile not null', listOfChecks[assessmentId.value].Milestones )
  // listOfChecks[assessmentId.value].forEach(o => {milestones.push({id:milestoneId.value, milestone:o.Milestone , date: null})})
  for (let i = 0; i < listOfChecks[assessmentId.value].EvaluationItems[0].Milestones.length; i++) {
    milestones.value.push({
      milestone: listOfChecks[assessmentId.value].EvaluationItems[0].Milestones[i].item,
      date: listOfChecks[assessmentId.value].EvaluationItems[0].Milestones[i].completion_date,
    });
  }
}
// else{
//     milestones = ref([{ milestone:null , date: null}])
// }

const threatLevel = [
  { id: 1, name: "Very Low", online: true },
  { id: 2, name: "Low", online: false },
  { id: 3, name: "Moderate", online: false },
  { id: 4, name: "High", online: true },
  { id: 5, name: "Very High", online: false },
];
let severityStart = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Severity != null) {
  severityStart = threatLevel.findIndex((o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Severity);
} else {
  severityStart = 0;
}

let severity = ref(threatLevel[severityStart]);

/// /
let relevanceStart = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Relevance_of_Threat != null) {
  relevanceStart = threatLevel.findIndex(
    (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Relevance_of_Threat,
  );
} else {
  relevanceStart = 0;
}

let relevance = ref(threatLevel[relevanceStart]);

/// /
let likelihoodStart = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Likelihood != null) {
  likelihoodStart = threatLevel.findIndex(
    (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Likelihood,
  );
} else {
  likelihoodStart = 0;
}

let likelihood = ref(threatLevel[likelihoodStart]);

/// /
let impactStart = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Impact != null) {
  impactStart = threatLevel.findIndex((o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Impact);
} else {
  impactStart = 0;
}

let impact = ref(threatLevel[impactStart]);

/// /
let riskStart = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Residual_Risk_Level != null) {
  riskStart = threatLevel.findIndex(
    (o) => o.name === listOfChecks[assessmentId.value].EvaluationItems[0].Residual_Risk_Level,
  );
} else {
  riskStart = 0;
}

let risk = ref(threatLevel[riskStart]);

/// /

/// //// Poam Fields
const editOffice = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Office_Org);
const editResources = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Resources_Required);
let editScheduledCompletionDate = ref();
if (listOfChecks[assessmentId.value].EvaluationItems[0].Scheduled_Completion_Date != null) {
  editScheduledCompletionDate = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Scheduled_Completion_Date);
} else {
  editScheduledCompletionDate = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Scheduled_Completion_Date);
}
const editMilestoneChanges = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Milestone_Changes);
const editPoamComments = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Poam_Comments);
const editMitigations = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Mitigations);

const editImpactDesc = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Impact_Description);
let editRecommendations = ref(listOfChecks[assessmentId.value].EvaluationItems[0].Recommendations);

function setFields(check) {
  editOffice.value = check.EvaluationItems[0].Office_Org;
  editResources.value = check.EvaluationItems[0].Resources_Required;

  if (check.EvaluationItems[0].Scheduled_Completion_Date != null) {
    editScheduledCompletionDate.value = check.EvaluationItems[0].Scheduled_Completion_Date.split("T", 1)[0];
  } else {
    editScheduledCompletionDate.value = check.EvaluationItems[0].Scheduled_Completion_Date;
  }
  editMilestoneChanges.value = check.EvaluationItems[0].Milestone_Changes;
  editPoamComments.value = check.EvaluationItems[0].Poam_Comments;
  editMitigations.value = check.EvaluationItems[0].Mitigations;

  editImpactDesc.value = check.EvaluationItems[0].Impact_Description;
  editRecommendations.value = check.EvaluationItems[0].Recommendations;
  if (check.EvaluationItems[0].Milestones && check.EvaluationItems[0].Milestones?.length !== 0) {
    milestones = ref([]);
    for (let i = 0; i < check.EvaluationItems[0].Milestones.length; i++) {
      milestones.value.push({
        milestone: check.EvaluationItems[0].Milestones[i].item,
        date: check.EvaluationItems[0].Milestones[i].completion_date,
      });
    }
  } else {
    milestones = ref([]);
  }

  // console.log('check', check)
}

/// /////////// Edit API
const editId = ref(listOfChecks[assessmentId.value].EvaluationItems[0].id);
const editFinding = ref();
const editComments = ref();
let findingList = "";
let commentList = "";
const assessmentList = listOfChecks[assessmentId.value].AssessmentItems;
for (let i = 0; i < assessmentList.length; i++) {
  const systemName = assessmentList[i].Assessment.System?.name || assessmentList[i].Assessment.System?.nam || "unknown";

  if (assessmentList[i].finding_details === null || assessmentList[i].finding_details.length < 1) {
    findingList += systemName + ": None\n";
  } else {
    findingList += systemName + ": " + assessmentList[i].finding_details + "\n";
  }
  if (assessmentList[i].comments === null || assessmentList[i].comments.length < 1) {
    commentList += systemName + ": None\n";
  } else {
    commentList += systemName + ": " + assessmentList[i].comments + "\n";
  }
}
editFinding.value = findingList;
editComments.value = commentList;

const editStatus = ref(selected.title);

function updateFinding(newAssessmentList) {
  findingList = "";
  for (let i = 0; i < newAssessmentList.length; i++) {
    if (newAssessmentList[i].finding_details === null || newAssessmentList[i].finding_details.length < 1) {
      findingList += newAssessmentList[i].Assessment.System.name + ": None\n";
    } else {
      findingList += newAssessmentList[i].Assessment.System.name + ": " + newAssessmentList[i].finding_details + "\n";
    }
  }
  return findingList;
}
function updateComment(newAssessmentList) {
  commentList = "";
  for (let i = 0; i < newAssessmentList.length; i++) {
    if (newAssessmentList[i].comments === null || newAssessmentList[i].comments.length < 1) {
      commentList += newAssessmentList[i].Assessment.System.name + ": None\n";
    } else {
      commentList += newAssessmentList[i].Assessment.System.name + ": " + newAssessmentList[i].comments + "\n";
    }
  }
  return commentList;
}

async function editAssessmentApi() {
  try {
    const milestoneText = [];
    milestones.value.forEach((o) => {
      milestoneText.push(o.milestone);
    });
    const milestoneDate = [];
    milestones.value.forEach((o) => {
      milestoneDate.push(o.date);
    });

    await $fetch("/api/evaluation/updateItem", {
      method: "PUT",
      body: {
        id: editId.value,
        BoundaryId: route.params.enclave,
        finding_details: editFinding.value,
        comments: editComments.value,
        status: editStatus.value,
        Office_Org: editOffice.value,
        Resources_Required: editResources.value,
        Scheduled_Completion_Date: editScheduledCompletionDate.value,
        Milestone: milestoneText,
        Milestone_Completion_Dte: milestoneDate,
        Milestone_Changes: editMilestoneChanges.value,
        Poam_Comments: editPoamComments.value,
        Mitigations: editMitigations.value,
        Severity: severity.value.name,
        Relevance_of_Threat: relevance.value.name,
        Likelihood: likelihood.value.name,
        Impact: impact.value.name,
        Impact_Description: editImpactDesc.value,
        Residual_Risk_Level: risk.value.name,
        Recommendations: editRecommendations.value,
      },
    });
    location.reload();
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

/// /// Overide Popup
const showOverride = ref(false);

function setIsOpen(value) {
  isOpen.value = value;
}
</script>
