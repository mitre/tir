<template>
  <main class=" ">
    <div class="mx-auto max-w-7xl px-4 pb-12">
      <div>
        <main>
          <header>
            <!-- Secondary navigation -->
            <nav class="z-10 flex border-b border-black/10 py-2 dark:border-white/10">
              <ul
                class="flex min-w-full flex-none justify-between px-4 text-sm font-semibold leading-6 text-gray-500 dark:text-gray-400"
              >
                <li>
                  <Popover class="relative inline-flex px-3">
                    <PopoverButton :id="id" class="hover:text-gray-800 dark:hover:text-white">
                      Add {{ assetView.alias }}
                    </PopoverButton>

                    <transition
                      enter-active-class="transition ease-out duration-200"
                      enter-from-class="opacity-0 translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition ease-in duration-150"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 translate-y-1"
                    >
                      <PopoverPanel class="absolute z-10 mt-8 flex w-max px-0">
                        <div
                          class="grid flex-auto grid-cols-2 rounded-2xl bg-white text-sm leading-6 shadow-lg dark:bg-gray-700"
                        >
                          <!-- COL 1 -->
                          <div class="p-2">
                            <span class="mb-2 flex items-center justify-center border-b-2 border-indigo-500">
                              <span class="pb-1 text-sm font-bold text-gray-800 dark:text-white"> General </span>
                            </span>
                            <div
                              v-for="(item, index) in addSystemGeneralItems"
                              :key="item.name"
                              class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              @click="[setOpen(index)]"
                            >
                              <div
                                class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                              >
                                <component
                                  :is="item.icon"
                                  class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                  aria-hidden="true"
                                />
                              </div>
                              <div
                                class="mr-1 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                              >
                                {{ item.name }}
                              </div>
                            </div>
                          </div>
                          <!-- COL 2 -->
                          <div class="p-2">
                            <span class="mb-2 flex items-center justify-center border-b-2 border-indigo-500">
                              <span class="pb-1 text-sm font-bold text-gray-800 dark:text-white"> Import </span>
                            </span>
                            <!-- CKL Import Dropdown-->
                            <div class="cursor-pointer rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
                              <label
                                class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              >
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                                >
                                  <FolderOpenIcon
                                    class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-4 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                                >
                                  Folder(s)

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <input
                                  id="uploadFolder"
                                  ref="fileInputFolder"
                                  name="files[]"
                                  type="file"
                                  webkitdirectory
                                  multiple
                                  class="hidden"
                                  @change="createSystem(false)"
                                />
                              </label>
                            </div>
                            <div class="cursor-pointer rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
                              <label
                                class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              >
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                                >
                                  <ArchiveBoxArrowDownIcon
                                    class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-4 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                                >
                                  .Zip Folder

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <input
                                  id="uploadZip"
                                  ref="fileInputZip"
                                  name="files[]"
                                  type="file"
                                  class="hidden"
                                  accept=".zip"
                                  @change="createSystem(true)"
                                />
                              </label>
                            </div>
                            <div class="cursor-pointer rounded-2xl"></div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>

                  <Popover class="relative inline-flex px-3">
                    <PopoverButton :id="id" class="hover:text-gray-800 dark:hover:text-white">
                      Import Results
                    </PopoverButton>

                    <transition
                      enter-active-class="transition ease-out duration-200"
                      enter-from-class="opacity-0 translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition ease-in duration-150"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 translate-y-1"
                    >
                      <PopoverPanel class="absolute z-10 mt-8 flex w-max px-0">
                        <div class="grid flex-auto rounded-2xl bg-white text-sm leading-6 shadow-lg dark:bg-gray-700">
                          <div class="p-2">
                            <span class="mb-2 flex items-center justify-center border-b-2 border-indigo-500">
                              <span class="pb-1 text-sm font-bold text-gray-800 dark:text-white"> Import </span>
                            </span>
                            <!-- CKL Import Dropdown-->
                            <div class="cursor-pointer rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
                              <label
                                class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              >
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                                >
                                  <FolderOpenIcon
                                    class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-4 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                                >
                                  Folder(s)

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <input
                                  id="uploadResultsFolder"
                                  ref="fileInputFolder"
                                  name="files[]"
                                  type="file"
                                  webkitdirectory
                                  multiple
                                  class="hidden"
                                  @change="handleChecklistChangeFolder(false)"
                                />
                              </label>
                            </div>
                            <div class="cursor-pointer rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
                              <label
                                class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              >
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                                >
                                  <ArchiveBoxArrowDownIcon
                                    class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-4 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                                >
                                  .Zip Folder

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <input
                                  id="uploadResultsZip"
                                  ref="fileInputZip"
                                  name="files[]"
                                  type="file"
                                  class="hidden"
                                  accept=".zip"
                                  @change="handleChecklistChangeFolder(true)"
                                />
                              </label>
                            </div>
                            <div class="cursor-pointer rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800">
                              <label
                                class="group flex cursor-pointer items-center gap-x-2 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800"
                              >
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-800"
                                >
                                  <CursorArrowRippleIcon
                                    class="h-6 w-6 text-gray-800 group-hover:text-indigo-600 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-4 items-center justify-center font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-white"
                                >
                                  File Selector

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <input
                                  id="uploadResultsMultiple"
                                  ref="fileInputMultiple"
                                  name="files[]"
                                  type="file"
                                  multiple
                                  class="hidden"
                                  @change="handleChecklistChange()"
                                />
                              </label>
                            </div>
                            <div class="cursor-pointer rounded-2xl"></div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>
                  <div class="relative inline-flex px-3">
                    <a href="#" class="hover:text-gray-800 dark:hover:text-white" @click="showExport = true"
                      >Export Data</a
                    >
                  </div>
                </li>
                <div class="w-36 text-right">
                  <Menu v-slot="{ open }" as="div" class="relative inline-block text-left">
                    <div>
                      <MenuButton :id="id" class="hover:text-gray-800 dark:hover:text-white">
                        <Cog6ToothIcon class="h-7 w-7 self-center" aria-hidden="true" />
                      </MenuButton>
                    </div>
                    <transition
                      enter-active-class="transition ease-out duration-100"
                      enter-from-class="transform opacity-0 scale-95"
                      enter-to-class="transform opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="transform opacity-100 scale-100"
                      leave-to-class="transform opacity-0 scale-95"
                    >
                      <div v-show="open">
                        <MenuItems
                          static
                          class="absolute right-0 mt-2 w-max origin-top-right divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:divide-gray-400 dark:bg-gray-700"
                        >
                          <div class="px-1 py-1">
                            <MenuItem v-slot="{ active }">
                              <button
                                :class="[
                                  active
                                    ? 'bg-gray-200 text-indigo-500 dark:bg-gray-800'
                                    : 'text-black dark:text-white ',
                                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                                ]"
                                @click="exportBoundary()"
                              >
                                <ArrowUpTrayIcon
                                  :active="active"
                                  class="mr-2 h-5 w-5 text-black group-hover:text-indigo-500 dark:text-white"
                                  aria-hidden="true"
                                />
                                {{ boundaryAlias.alias }} Export
                              </button>
                            </MenuItem>
                          </div>

                          <div class="px-1 py-1">
                            <MenuItem v-slot="{ active }">
                              <label
                                :class="[
                                  active
                                    ? 'bg-gray-200 text-indigo-500 dark:bg-gray-800'
                                    : 'text-black dark:text-white ',
                                  'group flex w-full cursor-pointer items-center rounded-md p-2 text-sm',
                                ]"
                              >
                                <ArrowDownTrayIcon
                                  :active="active"
                                  class="mr-2 h-5 w-5 text-black group-hover:text-indigo-500 dark:text-white"
                                  aria-hidden="true"
                                />
                                {{ boundaryAlias.alias }} Import
                                <input
                                  id="importFileBoundary"
                                  name="MyFiles[]"
                                  type="file"
                                  class="hidden"
                                  multiple
                                  @change="importBoundary()"
                                />
                              </label>
                            </MenuItem>
                          </div>
                        </MenuItems>
                      </div>
                    </transition>
                  </Menu>
                </div>
              </ul>
            </nav>

            <!-- Heading -->
            <div
              class="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8"
            >
              <div>
                <div class="flex items-center gap-x-3">
                  <div class="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                    <div class="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <h1 class="flex gap-x-3 text-base leading-7">
                    <span
                      class="cursor-pointer font-semibold text-gray-800 hover:text-indigo-500 dark:text-white dark:hover:text-indigo-500"
                      ><a @click="[router.push('/company-boundary/')]">{{ tierName }}</a></span
                    >

                    <span class="text-gray-600">/</span>
                    <span
                      class="cursor-pointer font-semibold text-gray-800 hover:text-indigo-500 dark:text-white dark:hover:text-indigo-500"
                      ><a @click="reloadNuxtApp()">{{ boundaryName }}</a></span
                    >
                  </h1>
                </div>
              </div>
              <div
                class="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none"
              >
                Production
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-3">
              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  Number of {{ inflection.pluralize(assetView.alias) }}
                </div>
                <div class="mt-2 items-baseline gap-x-2">
                  <span class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {{ summary.systemView.length }}
                  </span>
                </div>
              </div>
              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:border-l lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  <SummaryCounts
                    title="STIG Findings"
                    :items="hoverItems"
                    :stats1="summary.totalCounts"
                    :stats2="summary.uniqueCounts"
                  />
                </div>
              </div>
              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:border-l lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  <SummaryCounts
                    title="Vuln Findings"
                    :items="vulnHoverItems"
                    :stats1="summary.vulnTotalCounts"
                    :stats2="summary.vulnUniqueCounts"
                  />
                </div>
              </div>
              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:border-l sm:px-6 lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">NIST Version</div>
                <div class="mt-2 items-baseline gap-x-2">
                  <span class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {{ policyDocument.title }}
                  </span>
                </div>
              </div>

              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">Stig Baseline</div>
                <div class="mt-2 items-baseline gap-x-2">
                  <span class="break-all text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {{ summary.boundaryInfo.stigLibrary }}
                  </span>
                </div>
              </div>

              <div class="border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:border-l lg:px-8">
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  <ControlCounts
                    title="Control Status"
                    :items="sctmHoverItems"
                    :stats1="summary.assessorCounts"
                    :stats2="summary.auditCounts"
                  />
                </div>
              </div>
            </div>
          </header>

          <!-- Views -->
          <div class="mt-4">
            <TabGroup as="div" :default-index="activeTab">
              <TabList class="flex space-x-4 border-b-2 border-gray-400">
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'w-1/6 rounded-t-lg py-2.5 text-sm font-medium leading-5 text-black dark:text-white',
                      'ring-white/60 focus:outline-none focus:ring-1',
                      selected
                        ? 'border-x-2 border-t-2 border-gray-400 bg-gray-400/20 dark:bg-gray-200/20 '
                        : ' hover:bg-black/[0.12] dark:hover:bg-white/[0.12] ',
                    ]"
                  >
                    {{ currentAlias.find((item) => item.term === "Boundary")?.alias }} View
                  </button>
                </Tab>
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'w-1/6 rounded-t-lg py-2.5 text-sm font-medium leading-5 text-black dark:text-white',
                      'ring-white/60 focus:outline-none focus:ring-1',
                      selected
                        ? 'border-x-2 border-t-2 border-gray-400 bg-gray-400/20 dark:bg-gray-200/20 '
                        : 'hover:bg-black/[0.12] dark:hover:bg-white/[0.12] ',
                    ]"
                  >
                    {{ assetView.alias }} View
                  </button>
                </Tab>
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'w-1/6 rounded-t-lg py-2.5 text-sm font-medium leading-5 text-black dark:text-white',
                      'ring-white/60 focus:outline-none focus:ring-1',
                      selected
                        ? 'border-x-2 border-t-2 border-gray-400 bg-gray-400/20 dark:bg-gray-200/20 '
                        : 'hover:bg-black/[0.12] dark:hover:bg-white/[0.12] ',
                    ]"
                  >
                    Vulnerability View
                  </button>
                </Tab>
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'w-1/6 rounded-t-lg py-2.5 text-sm font-medium leading-5 text-black dark:text-white',
                      'ring-white/60 focus:outline-none focus:ring-1',
                      selected
                        ? 'border-x-2 border-t-2 border-gray-400 bg-gray-400/20 dark:bg-gray-200/20 '
                        : 'hover:bg-black/[0.12] dark:hover:bg-white/[0.12] ',
                    ]"
                  >
                    SCTM View
                  </button>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel><BoundaryView :summary="summary" /></TabPanel>
                <TabPanel><SystemView :summary="summary" :asset-view="assetView" /></TabPanel>
                <TabPanel><VulnView :summary="summary" /></TabPanel>
                <TabPanel><SctmView :summary="summary" @refresh-summary="() => refreshNuxtData('SummaryAPI')" /></TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </main>
      </div>
    </div>
    <!--Add System Form-->

    <TransitionRoot as="template" :show="open">
      <Dialog as="div" class="relative z-10" @close="open = false">
        <div class="fixed inset-0" />

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <TransitionChild
                as="template"
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enter-from="translate-x-full"
                enter-to="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leave-from="translate-x-0"
                leave-to="translate-x-full"
              >
                <DialogPanel class="pointer-events-auto w-screen max-w-lg">
                  <form
                    class="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:bg-gray-800"
                    @submit.prevent="[addSystem(), (open = false)]"
                  >
                    <div class="h-0 flex-1 overflow-y-auto">
                      <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                        <div class="flex items-center justify-between">
                          <DialogTitle class="text-base font-semibold leading-6 text-white"
                            >New {{ assetView.alias }}</DialogTitle
                          >
                          <div class="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              class="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              @click="open = false"
                            >
                              <span class="absolute -inset-2.5" />
                              <span class="sr-only">Close panel</span>
                              <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div class="mt-1">
                          <p class="text-sm text-indigo-300">
                            Get started by filling in the information below to create your new
                            {{ assetView.alias.toLowerCase() }}.
                          </p>
                        </div>
                      </div>
                      <div class="flex flex-1 flex-col justify-between">
                        <div class="divide-y divide-gray-200 px-4 sm:px-6">
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                              >
                                {{ assetView.alias }} Name</label
                              >
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="systemName"
                                  required
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>

                          <!-- New labels  -->
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Host Name</label
                              >
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="vHost"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Host IP Address
                              </label>
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="vHostIP"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Host MAC Address</label
                              >
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="vHostMac"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Host Fully Qualified Domain Name</label
                              >
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="vHostF"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Target Comment</label
                              >
                              <div class="mt-2">
                                <input
                                  id="project-name"
                                  v-model="vTargetComment"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <!-- --- Role drop down -- -->
                          <Listbox v-if="edit != true" v-model="selectedRole" as="div">
                            <br />
                            <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >Roles</ListboxLabel
                            >
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ selectedRole.name }}</span>
                                </span>
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
                                  class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                  <ListboxOption
                                    v-for="item in roles"
                                    :key="item.id"
                                    v-slot="{ active, selected }"
                                    as="template"
                                    :value="item"
                                  >
                                    <li
                                      :class="[
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                      ]"
                                    >
                                      <div class="flex">
                                        <span
                                          :class="[selected ? 'font-semibold' : 'font-normal', 'truncate text-xs']"
                                          >{{ item.name }}</span
                                        >
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
                            <br />
                          </Listbox>
                          <!-- --- end of role drop down -- -->
                          <!-- Beginning of checkbox  -->
                          <fieldset>
                            <br />
                            <div class="space-y-5">
                              <div class="relative flex items-start">
                                <div class="flex h-6 items-center">
                                  <input
                                    id="comments"
                                    v-model="vCheckbox"
                                    aria-describedby="comments-description"
                                    name="comments"
                                    type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                </div>
                                <div class="ml-3 text-sm leading-6">
                                  <label
                                    for="comments"
                                    class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                    >Web or Database STIG</label
                                  >
                                </div>
                              </div>
                            </div>
                            <br />
                          </fieldset>
                          <!-- end of checkbox -->
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Site</label
                              >
                              <div class="mt-2">
                                <input
                                  v-if="vCheckbox"
                                  id="project-name"
                                  v-model="vSite"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                for="project-name"
                                class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                >Instance</label
                              >
                              <div class="mt-2">
                                <input
                                  v-if="vCheckbox"
                                  id="project-name"
                                  v-model="vInstance"
                                  type="text"
                                  name="project-name"
                                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- end of the new labels -->
                      </div>
                    </div>
                    <div class="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        @click="[(open = false)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!--End-->
    <TransitionRoot as="template" :show="loading">
      <Dialog as="div" class="relative z-10" @close="loading = false">
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
        <div class="fixed inset-0 z-10 overflow-y-auto">
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
                class="relative transform overflow-hidden rounded-lg bg-gray-200 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
              >
                <div>
                  <div class="flex h-7 items-center">
                    <button
                      type="button"
                      class="rounded-md bg-gray-200 text-indigo-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-900 dark:text-indigo-200"
                      @click="loading = false"
                    >
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div class="text-center">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-white"
                      >Updating {{ inflection.pluralize(assetView.alias) }}
                    </DialogTitle>
                    <div class="mb-8 mt-2">
                      <p class="text-sm text-black dark:text-white">Please Wait...</p>
                    </div>

                    <UProgress animation="carousel" color="indigo" :value="loadingProgress" :max="maxValues" />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <TransitionRoot as="template" :show="userInputModule">
      <Dialog as="div" class="relative z-10" @close="userInputModule = false">
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
        <div class="fixed inset-0 z-10 overflow-y-auto">
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
                class="relative h-max w-2/3 transform overflow-y-auto rounded-lg bg-gray-200 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900"
              >
                <div class="px-4 dark:bg-gray-900 sm:px-6 lg:px-8">
                  <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                      <h1 class="text-lg font-semibold leading-6 text-black dark:text-white">Import Results</h1>
                      <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-300">
                        Results could not be automatically applied.
                      </p>
                      <p class="mt-2 text-sm text-gray-800 dark:text-gray-300">
                        Review the list of imported results and select the system to apply them to.
                      </p>
                    </div>
                  </div>

                  <div class="mt-8 flow-root">
                    <div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                      <div class="inline-block min-w-full py-6 align-middle sm:px-6 lg:px-8">
                        <div class="relative">
                          <ul role="list" class="divide-y divide-white/5 shadow-sm">
                            <li
                              v-for="(item, folder) in needsInput"
                              :key="item.folder"
                              class="bg-gray-200 shadow-lg dark:bg-gray-800"
                            >
                              <Disclosure>
                                <DisclosureButton
                                  class="flex w-full items-center bg-gray-400 text-white hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500"
                                >
                                  <p class="relative isolate mr-4 p-4 text-left font-semibold">
                                    {{ item.folder }}
                                  </p>

                                  <Combobox
                                    v-if="item.folder.search('.nessus') == -1"
                                    v-model="folderSystem[folder]"
                                    as="div"
                                    @update:model-value="[updateFolder(folder, folderSystem[folder]), (query = '')]"
                                  >
                                    <div class="relative font-medium">
                                      <ComboboxInput
                                        class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                        :display-value="(system) => system?.name"
                                        @click.stop
                                        @change="query = $event.target.value"
                                        @blur="query = ''"
                                      />
                                      <ComboboxButton
                                        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                                      >
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                      </ComboboxButton>

                                      <ComboboxOptions
                                        v-if="filteredSystems.length > 0"
                                        class="absolute z-10 mt-1 max-h-28 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
                                      >
                                        <ComboboxOption
                                          v-for="system in filteredSystems"
                                          :key="system.id"
                                          v-slot="{ active, selected }"
                                          :value="system"
                                          as="template"
                                        >
                                          <li
                                            :class="[
                                              'relative cursor-default select-none py-2 pl-3 pr-9 text-left',
                                              active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white',
                                            ]"
                                          >
                                            <span :class="['block truncate', selected && 'font-semibold']">
                                              {{ system.name }}
                                            </span>

                                            <span
                                              v-if="selected"
                                              :class="[
                                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                                active ? 'text-white' : 'text-indigo-600',
                                              ]"
                                            >
                                              <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          </li>
                                        </ComboboxOption>
                                      </ComboboxOptions>
                                    </div>
                                  </Combobox>
                                </DisclosureButton>
                                <transition
                                  enter-active-class="transform transition ease-in-out duration-500"
                                  enter-from-class="-translate-y-10 scale-95 opacity-0"
                                  enter-to-class="-translate-y-0 scale-100 opacity-100 "
                                  leave-active-class="transform transition ease-in-out duration-500"
                                  leave-from-class="-translate-y-0 scale-100 opacity-100"
                                  leave-to-class="-translate-y-10 scale-95 opacity-0"
                                >
                                  <DisclosurePanel
                                    class="w-full divide-y divide-black/10 text-gray-500 dark:divide-white/10"
                                  >
                                    <div
                                      v-for="(file, index) in item.files"
                                      :key="file.name"
                                      class="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    >
                                      <div
                                        class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-gray-300"
                                      >
                                        <Combobox
                                          v-if="item.folder.search('.nessus') == -1"
                                          v-model="selectedSystem[folder][index]"
                                          as="div"
                                          @update:model-value="[(folderSystem[folder] = null), (query = '')]"
                                        >
                                          <div class="relative">
                                            <ComboboxInput
                                              class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                              :display-value="(system) => system?.name"
                                              @change="query = $event.target.value"
                                              @blur="query = ''"
                                            />
                                            <ComboboxButton
                                              class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                                            >
                                              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </ComboboxButton>

                                            <ComboboxOptions
                                              v-if="filteredSystems.length > 0"
                                              class="absolute z-10 mt-1 max-h-28 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
                                            >
                                              <ComboboxOption
                                                v-for="system in filteredSystems"
                                                :key="system.id"
                                                v-slot="{ active, selected }"
                                                :value="system"
                                                as="template"
                                              >
                                                <li
                                                  :class="[
                                                    'relative cursor-default select-none py-2 pl-3 pr-9',
                                                    active
                                                      ? 'bg-indigo-600 text-white'
                                                      : 'text-gray-900 dark:text-white',
                                                  ]"
                                                >
                                                  <span :class="['block truncate', selected && 'font-semibold']">
                                                    {{ system.name }}
                                                  </span>

                                                  <span
                                                    v-if="selected"
                                                    :class="[
                                                      'absolute inset-y-0 right-0 flex items-center pr-4',
                                                      active ? 'text-white' : 'text-indigo-600',
                                                    ]"
                                                  >
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                  </span>
                                                </li>
                                              </ComboboxOption>
                                            </ComboboxOptions>
                                          </div>
                                        </Combobox>
                                        <Combobox
                                          v-else
                                          v-model="selectedSystem[folder][index]"
                                          as="div"
                                          @update:model-value="
                                            [
                                              updateSelection(selectedSystem[folder][index], folder, index),
                                              (query = ''),
                                            ]
                                          "
                                        >
                                          <div class="relative">
                                            <ComboboxInput
                                              class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                              :display-value="(system) => system?.name"
                                              @change="query = $event.target.value"
                                              @blur="query = ''"
                                              @keyup.enter="
                                                [updateSelection(selectedSystem[folder][index], folder, index)]
                                              "
                                            />
                                            <ComboboxButton
                                              class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                                            >
                                              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </ComboboxButton>

                                            <ComboboxOptions
                                              v-if="filteredSystems.length > 0"
                                              class="absolute z-10 mt-1 max-h-28 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm"
                                            >
                                              <ComboboxOption
                                                v-for="system in nessusSystems"
                                                :key="system.id"
                                                v-slot="{ active, selected }"
                                                :value="system"
                                                as="template"
                                              >
                                                <li
                                                  :class="[
                                                    'relative cursor-default select-none py-2 pl-3 pr-9',
                                                    active
                                                      ? 'bg-indigo-600 text-white'
                                                      : 'text-gray-900 dark:text-white',
                                                  ]"
                                                >
                                                  <span :class="['block truncate', selected && 'font-semibold']">
                                                    {{ system.name }}
                                                  </span>

                                                  <span
                                                    v-if="selected"
                                                    :class="[
                                                      'absolute inset-y-0 right-0 flex items-center pr-4',
                                                      active ? 'text-white' : 'text-indigo-600',
                                                    ]"
                                                  >
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                  </span>
                                                </li>
                                              </ComboboxOption>
                                            </ComboboxOptions>
                                          </div>
                                        </Combobox>
                                      </div>
                                      <div
                                        class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-gray-300"
                                      >
                                        {{ file.name }}
                                      </div>
                                    </div>
                                  </DisclosurePanel>
                                </transition>
                              </Disclosure>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-16 text-center">
                  <button
                    type="button"
                    class="w-sm inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="userInputModule = false"
                  >
                    Back to {{ boundaryAlias.alias }}
                  </button>

                  <button
                    type="submit"
                    class="w-sm ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="saveAssignment()"
                  >
                    Save Assignment
                  </button>
                </div>
                <div v-if="saveError" class="mt-4">
                  <p class="align-center animate-pulse text-center font-semibold text-red-500">
                    Assign a System to every CKL import
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <TransitionRoot as="template" :show="nessusWarning">
      <Dialog as="div" class="relative z-10" @close="nessusWarning = false">
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
        <div class="fixed inset-0 z-10 content-center">
          <div class="flex items-center justify-center p-4 text-center">
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
                class="relative my-8 w-full max-w-xl transform rounded-lg bg-gray-200 p-6 text-left shadow-xl transition-all dark:bg-gray-900"
              >
                <div>
                  <div class="flex h-7 items-center">
                    <button
                      type="button"
                      class="rounded-md bg-gray-200 text-indigo-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-900 dark:text-indigo-200"
                      @click="nessusWarning = false"
                    >
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div class="text-center">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-white"
                    >Warning:
                  </DialogTitle>
                  <div class="mb-8 mt-2">
                    <p class="text-sm text-black dark:text-white">
                      The following scans are not credentialed and will not be included in the import
                    </p>
                  </div>
                </div>
                <div class="h-96 overflow-y-auto rounded-lg">
                  <div v-for="item in notCredentialed" :key="item.file" class="relative">
                    <div
                      class="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-bold leading-6 text-gray-900"
                    >
                      <h3>{{ item.file }}</h3>
                    </div>
                    <ul role="list" class="divide-y divide-gray-100">
                      <li
                        v-for="name in item.name"
                        :key="name"
                        class="flex gap-x-4 bg-gray-300 px-3 py-5 dark:bg-gray-800"
                      >
                        <div class="min-w-0">
                          <p class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">{{ name }}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="mt-16 content-center text-center">
                  <button
                    type="button"
                    class="w-sm inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="nessusWarning = false"
                  >
                    Back to Boundary
                  </button>

                  <button
                    type="submit"
                    class="w-sm ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="[(nessusWarning = false), proceedWithImport()]"
                  >
                    Proceed with Import
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <Export
      v-if="showExport"
      :open="showExport"
      :boundary-id="boundaryId"
      :boundary-name="boundaryName"
      @show-export="showExport = false"
    />
    <QuickAdd
      v-if="openWidget"
      :open-members="openWidget"
      :boundary-id="boundaryId"
      :library-id="summary?.boundaryInfo.StigLibraryId"
      @open-close="[(openWidget = false), refreshNuxtData('SummaryAPI')]"
    />
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :error="errorObject"
      @show="showErrorNotification = false"
    />
    <LoadingNotification
      v-if="loadingNotification"
      :show="loadingNotification"
      :msg="loadingMsg"
      @show="loadingNotification = false"
    />
  </main>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Popover,
  PopoverButton,
  PopoverPanel,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/vue";
import {
  XMarkIcon,
  CursorArrowRaysIcon,
  SquaresPlusIcon,
  FolderOpenIcon,
  ArchiveBoxArrowDownIcon,
  ChevronUpDownIcon,
  CheckIcon,
  CursorArrowRippleIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/vue/24/outline";
import inflection from "inflection";
import { unZip } from "~/utils/zip";
import { processNessus } from "~/utils/nessus";
import { processChecklist } from "~/utils/checklist";
import { processChecklistV3 } from "~/utils/checklistV3";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { SystemRoles } from "~/types/system";
import SummaryCounts from "~/components/SummaryCounts.vue";
import { useQuickAddStore } from "~~/stores/QuickAdd";

import type { TirAlias } from "~/db/models/tirAlias";

definePageMeta({
  middleware: ["member-access"],
});
const id = useId();
// const storeID = useIdStorageStore();
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const systemName = ref("");
const vHost = ref("");
const vHostIP = ref("");
const vHostMac = ref("");
const vHostF = ref("");
const vTargetComment = ref("");
const vSite = ref("");
const vInstance = ref("");
const vCheckbox = ref(false);
const selectedRole = ref("");
const showErrorNotification = ref(false);
const errorObject = ref();
const open = ref(false);
const loadingNotification = ref(false);
const loadingMsg = ref("");
const showExport = ref(false);
const edit = ref(false);
const loadingProgress = ref(0);
const maxValues = ref([""]);

const tabIndices = {
  BoundaryView: 0,
  SystemView: 1,
  VulnView: 2,
} as const;

const activeView = (route.query.activeView as keyof typeof tabIndices) || "BoundaryView";
const activeTab = ref<number>(tabIndices[activeView]);

const roles = Object.keys(SystemRoles).map((key) => ({
  id: key,
  name: SystemRoles[key as keyof typeof SystemRoles],
}));

const hoverItems = [
  { name: "NotAFinding", text: "Not a Finding", color: "green" },
  { name: "Open", text: "Open", color: "red" },
  { name: "Not_Applicable", text: "Not Applicable", color: "sky" },
  { name: "Not_Reviewed", text: "Not Reviewed", color: "amber" },
];
const vulnHoverItems = [
  { name: "Critical", text: "Critical", color: "red" },
  { name: "High", text: "High", color: "orange" },
  { name: "Medium", text: "Medium", color: "amber" },
  { name: "Low", text: "Low", color: "sky" },
  { name: "None", text: "None", color: "grey" },
];

const sctmHoverItems = [
  { name: "Compliant", text: "Compliant", color: "green" },
  { name: "Non_Compliant", text: "Non-Compliant", color: "red" },
  { name: "Not_Applicable", text: "Not Applicable", color: "sky" },
  { name: "Not_Reviewed", text: "Not Reviewed", color: "amber" },
];
// Boundary Summary
const boundaryId = route.params.boundaryId;
const { data: summary } = await useFetch("/api/boundaries/summary", {
  method: "GET",
  query: { BoundaryId: boundaryId },
  key: "SummaryAPI",
});

// for the term alias
const { data: currentAlias } = await useFetch<TirAlias[]>("/api/config/alias");
// renders the current alias
const assetView = currentAlias.value?.find((alias) => alias.term === "System");
const boundaryAlias = currentAlias.value?.find((alias) => alias.term === "Boundary") || "Boundary";

const tierName = summary.value?.boundaryInfo.Tier;
const boundaryName = summary.value?.boundaryInfo.name;
const policyDocument = summary.value?.boundaryInfo.PolicyDocument;

// Generating the system with their info
async function addSystem() {
  try {
    await $fetch("/api/systems/create", {
      method: "POST",
      body: {
        name: systemName.value,
        BoundaryId: boundaryId,
        hostName: vHost.value,
        hostIP: vHostIP.value,
        hostMAC: vHostMac.value,
        hostFQDN: vHostF.value,
        targetComment: vTargetComment.value,
        role: selectedRole.value.name,
        webOrDatabase: vCheckbox.value,
        webDBSite: vSite.value,
        webDBInstance: vInstance.value,
      },
    });
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    refreshNuxtData("SummaryAPI");
  }
}

/// //// Quick Add
// const libraryId = ref(summary.value.boundaryInfo.StigLibraryId);
const openWidget = ref(false);
function setOpen(index) {
  if (index === 0) {
    systemName.value = "";
    vHost.value = "";
    vHostIP.value = "";
    vHostMac.value = "";
    vHostF.value = "";
    vTargetComment.value = "";
    vSite.value = "";
    vInstance.value = "";
    vCheckbox.value = false;
    selectedRole.value = "";
    open.value = true;
    openWidget.value = false;
  } else if (index === 1) {
    openWidget.value = true;
  } else {
    openWidget.value = false;
  }
}
// CKL System Creation
async function createSystem(isZip) {
  maxValues.value = ["Waiting to start", `Creating ${assetView.alias}...`, "Importing Data...", "Done!"];
  loading.value = true;
  loadingProgress.value = 0;
  const folder = ref();
  const nextFolder = ref();
  const selectedFiles = ref();
  const systemName = ref();
  const nextSystemName = ref();

  if (isZip) {
    const fileInputS = document.getElementById("uploadZip");
    selectedFiles.value = fileInputS.files;

    folder.value = selectedFiles.value[0].name.split(".zip");
    systemName.value = folder.value[0];
    const formdata = new FormData();
    for (let i = 0; i < selectedFiles.value.length; i++) {
      formdata.append("files", selectedFiles.value[i]);
    }

    try {
      formdata.append("SystemName", systemName.value);
      formdata.append("BoundaryId", boundaryId);
      loadingProgress.value = 2;
      await $fetch("/api/import/results", { method: "POST", body: formdata });
      loadingProgress.value = 3;
    } catch (err) {
      errorObject.value = err;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  } else {
    const fileInputS = document.getElementById("uploadFolder");
    selectedFiles.value = fileInputS.files;

    const formdata = new FormData();
    formdata.append("BoundaryId", boundaryId);

    for (let i = 0; i < selectedFiles.value.length; i++) {
      if (i === 0) {
        folder.value = selectedFiles.value[i].webkitRelativePath.split("/");
        if (folder.value.length === 3) {
          systemName.value = folder.value[1];
        } else {
          systemName.value = folder.value[0];
        }
      } else {
        nextFolder.value = selectedFiles.value[i].webkitRelativePath.split("/");
        nextSystemName.value = nextFolder.value[1];
      }
      if (
        nextFolder.value !== undefined &&
        nextFolder.value.length === 3 &&
        nextSystemName.value !== systemName.value
      ) {
        try {
          loadingProgress.value = 1;
          await $fetch("/api/systems/create", {
            method: "POST",
            body: { name: systemName.value, BoundaryId: boundaryId },
          });
          loadingProgress.value = 2;
          await $fetch("/api/import/results", { method: "POST", body: formdata });
          loadingProgress.value = 3;
        } catch (err) {
          errorObject.value = err;
          showErrorNotification.value = true;
          setTimeout(() => (showErrorNotification.value = false), 6000);
        }

        formdata.delete("files");
        formdata.delete("SystemId");
        formdata.append("files", selectedFiles.value[i]);
        systemName.value = nextFolder.value[1];
      } else {
        formdata.append("files", selectedFiles.value[i]);
      }
      if (i === selectedFiles.value.length - 1) {
        try {
          loadingProgress.value = 1;
          await $fetch("/api/systems/create", {
            method: "POST",
            body: { name: systemName.value, BoundaryId: boundaryId },
          });
          loadingProgress.value = 2;
          await $fetch("/api/import/results", { method: "POST", body: formdata });
          loadingProgress.value = 3;
        } catch (err) {
          errorObject.value = err;
          showErrorNotification.value = true;
          setTimeout(() => (showErrorNotification.value = false), 6000);
        }
      }
    }
  }

  refreshNuxtData("SummaryAPI");
  setTimeout(() => (loading.value = false), 2000);
}

const addSystemGeneralItems = [
  {
    name: "Single",
    description: "Manually and quickly create your Boundaries and Systems",
    href: "#",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Widget",
    description: "Manually and quickly create your Boundaries and Systems",
    href: "#",
    icon: SquaresPlusIcon,
  },
];

const store = useQuickAddStore();
store.SystemStigData = [];
store.id = 0;

///  Import Checklist
interface InputItem {
  folder: string;
  files?: any[];
  file?: any;
}

const needsInput = ref<InputItem[]>([]);

const notCredentialed = ref([]);
const userInputModule = ref(false);
const nessusWarning = ref(false);

async function handleChecklistChangeFolder(zip) {
  await refreshNuxtData("SummaryAPI");
  needsInput.value.length = 0;
  notCredentialed.value.length = 0;
  const formdata = new FormData();

  const selectedFiles = ref();
  const folder = ref();
  const systemName = ref();
  let nameMatch = false;
  maxValues.value = ["Waiting to start", "Checking Imports", "Importing Data...", "Done!"];
  loadingProgress.value = 0;
  if (zip) {
    loading.value = true;
    loadingProgress.value = 1;
    const fileInputS = document.getElementById("uploadResultsZip");
    selectedFiles.value = fileInputS.files;

    folder.value = selectedFiles.value[0].name.split(".zip");
    systemName.value = folder.value[0];
    const { data: SystemList } = await useFetch("/api/systems/list", {
      key: "list",
      method: "POST",
      body: { boundary: boundaryId },
    });
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const unZipResults = await unZip(selectedFiles.value[i], SystemList.value);
      loading.value = false;
      if (unZipResults.nessus && !unZipResults.ckl && !unZipResults.cklb) {
        for (let j = 0; j < unZipResults.results.length; j++) {
          const nessusArray = [];

          for (let k = 0; k < unZipResults.results[j].hostArray.length; k++) {
            if (unZipResults.results[j].hostArray[k].systemMatch) {
              // Import Nessus File
              nessusArray.push({
                SystemId: unZipResults.results[j].hostArray[k].systemId,
                NessusHostName: unZipResults.results[j].hostArray[k].name,
              });
            } else if (unZipResults.results[j].hostArray[k].credentialed === "true") {
              const folderLocation = needsInput.value.findIndex((o) => o.folder === unZipResults.files[j].name);
              if (folderLocation !== -1) {
                needsInput.value[folderLocation].files.push(unZipResults.results[j].hostArray[k]);
              } else {
                needsInput.value.push({
                  folder: unZipResults.files[j].name,
                  files: [unZipResults.results[j].hostArray[k]],
                  file: selectedFiles.value[i],
                });
              }
            } else if (unZipResults.results[j].hostArray[k].credentialed === "false") {
              const folderLocation = notCredentialed.value.findIndex((o) => o.file === unZipResults.files[j].name);
              if (folderLocation !== -1) {
                notCredentialed.value[folderLocation].name.push(unZipResults.results[j].hostArray[k].name);
              } else {
                notCredentialed.value.push({
                  file: unZipResults.files[j].name,
                  name: [unZipResults.results[j].hostArray[k].name],
                });
              }
            }
          }
          if (nessusArray.length > 0) {
            formdata.append("files", selectedFiles.value[i]);
            formdata.append("systemsMatchArray", JSON.stringify(nessusArray));
            formdata.append("BoundaryId", boundaryId);
            nameMatch = true;
          }
        }
      } else if ((unZipResults.ckl || unZipResults.cklb) && !unZipResults.nessus) {
        for (let j = 0; j < unZipResults.results.length; j++) {
          if (unZipResults.results[j].systemMatch) {
            // Import Ckl File
            nameMatch = true;
            formdata.append("files", selectedFiles.value[i]);
            formdata.append("SystemName", unZipResults.results[j].systemName);
            formdata.append("BoundaryId", boundaryId);
          } else {
            const folderLocation = needsInput.value.findIndex((o) => o.folder === systemName.value);
            if (folderLocation !== -1) {
              needsInput.value[folderLocation].files.push(selectedFiles.value[i]);
            } else {
              needsInput.value.push({ folder: systemName.value, files: [selectedFiles.value[i]] });
            }
          }
        }
      } else if (summary.value.systemView.findIndex((o) => o.name === systemName.value) !== -1) {
        formdata.append("files", selectedFiles.value[i]);
        formdata.append("SystemName", systemName.value);
        formdata.append("BoundaryId", boundaryId);
        nameMatch = true;
      } else {
        const folderLocation = needsInput.value.findIndex((o) => o.folder === systemName.value);
        if (folderLocation !== -1) {
          needsInput.value[folderLocation].files.push(selectedFiles.value[i]);
        } else {
          needsInput.value.push({ folder: systemName.value, files: [selectedFiles.value[i]] });
        }
      }
    }
  } else {
    loading.value = true;
    loadingProgress.value = 1;
    const fileInputS = document.getElementById("uploadResultsFolder");
    selectedFiles.value = fileInputS?.files;
    const { data: SystemList } = await useFetch("/api/systems/list", {
      key: "list",
      method: "POST",
      body: { boundary: boundaryId },
    });
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const nessusArray = [];
      const name = selectedFiles.value[i].name;
      const lastDot = name.lastIndexOf(".");
      const ext = name.substring(lastDot + 1);

      if (ext === "nessus") {
        const reader = new FileReader();
        reader.readAsText(selectedFiles.value[i]);
        const result = await new Promise((resolve) => {
          reader.onload = function () {
            resolve(reader.result);
          };
        });

        const nessusResult = await processNessus(result, SystemList.value);

        for (let j = 0; j < nessusResult.hostArray.length; j++) {
          if (nessusResult.hostArray[j].systemMatch) {
            // Import Nessus File
            nessusArray.push({
              SystemId: nessusResult.hostArray[j].systemId,
              NessusHostName: nessusResult.hostArray[j].name,
            });
          } else if (nessusResult.hostArray[j].credentialed === "true") {
            const folderLocation = needsInput.value.findIndex((o) => o.folder === name);
            if (folderLocation !== -1) {
              needsInput.value[folderLocation].files.push(nessusResult.hostArray[j]);
            } else {
              needsInput.value.push({ folder: name, files: [nessusResult.hostArray[j]], file: selectedFiles.value[i] });
            }
          } else if (nessusResult.hostArray[j].credentialed === "false") {
            const folderLocation = notCredentialed.value.findIndex((o) => o.file === name);
            if (folderLocation !== -1) {
              notCredentialed.value[folderLocation].name.push(nessusResult.hostArray[j].name);
            } else {
              notCredentialed.value.push({ file: name, name: [nessusResult.hostArray[j].name] });
            }
          }
        }
      } else if (ext === "ckl") {
        // For CKL system match
        const reader = new FileReader();
        reader.readAsText(selectedFiles.value[i]);
        const result = await new Promise((resolve) => {
          reader.onload = function () {
            resolve(reader.result);
          };
        });

        const checklistResult = await processChecklist(result, SystemList.value);
        if (checklistResult.systemMatch && checklistResult.systemId) {
          nameMatch = true;
          formdata.append("files", selectedFiles.value[i]);
          formdata.append("SystemName", checklistResult.systemName);
          formdata.append("BoundaryId", boundaryId);
        } else {
          const folderLocation = needsInput.value.findIndex((o) => o.folder === "Multiple Files");
          if (folderLocation !== -1) {
            needsInput.value[folderLocation].files.push(selectedFiles.value[i]);
          } else {
            needsInput.value.push({ folder: "Multiple Files", files: [selectedFiles.value[i]] });
          }
        }
      } else if (ext === "cklb") {
        // For CKL system match
        const reader = new FileReader();
        reader.readAsText(selectedFiles.value[i]);
        const result = await new Promise((resolve) => {
          reader.onload = function () {
            resolve(reader.result);
          };
        });
        const checklistResult = await processChecklistV3(result, SystemList.value);
        if (checklistResult.systemMatch && checklistResult.systemId) {
          nameMatch = true;
          formdata.append("files", selectedFiles.value[i]);
          formdata.append("SystemName", checklistResult.systemName);
          formdata.append("BoundaryId", boundaryId);
        } else {
          const folderLocation = needsInput.value.findIndex((o) => o.folder === "Multiple Files");
          if (folderLocation !== -1) {
            needsInput.value[folderLocation].files.push(selectedFiles.value[i]);
          } else {
            needsInput.value.push({ folder: "Multiple Files", files: [selectedFiles.value[i]] });
          }
        }
      } else {
        folder.value = selectedFiles.value[i].webkitRelativePath.split("/");
        if (folder.value.length === 3) {
          systemName.value = folder.value[1];
        } else {
          systemName.value = folder.value[0];
        }
        if (summary.value?.systemView.findIndex((o) => o.name === systemName.value) !== -1) {
          nameMatch = true;
          formdata.append("files", selectedFiles.value[i]);
          formdata.append("SystemName", systemName.value);
          formdata.append("BoundaryId", boundaryId);
        } else {
          const folderLocation = needsInput.value.findIndex((o) => o.folder === systemName.value);
          if (folderLocation !== -1) {
            needsInput.value[folderLocation].files.push(selectedFiles.value[i]);
          } else {
            needsInput.value.push({ folder: systemName.value, files: [selectedFiles.value[i]] });
          }
        }
      }
      if (nessusArray.length > 0) {
        formdata.append("files", selectedFiles.value[i]);
        formdata.append("systemsMatchArray", JSON.stringify(nessusArray));
        formdata.append("BoundaryId", boundaryId);
        nameMatch = true;
      }
    }
    loading.value = false;
  }

  if (nameMatch) {
    loading.value = true;
    await importResult(formdata);
    loading.value = false;
  }

  if (notCredentialed.value.length > 0) {
    nessusWarning.value = true;
  } else if (needsInput.value.length !== 0) {
    selectedSystem.value.length = 0;
    selectedNessusSystems.value.length = 0;
    folderSystem.value.length = 0;
    for (let i = 0; i < needsInput.value.length; i++) {
      selectedSystem.value.push([]);
    }
    userInputModule.value = true;
  }
}

async function handleChecklistChange() {
  maxValues.value = ["Waiting to start", "Checking Imports", "Importing Data...", "Done!"];
  loading.value = true;
  loadingProgress.value = 1;
  needsInput.value.length = 0;
  notCredentialed.value.length = 0;
  let importNessus = false;
  let importCkl = false;
  const fileInput = document.getElementById("uploadResultsMultiple");
  const selectedFiles = fileInput?.files;
  const formdata = new FormData();
  const { data: SystemList } = await useFetch("/api/systems/list", {
    key: "list",
    method: "POST",
    body: { boundary: boundaryId },
  });
  for (let i = 0; i < selectedFiles.length; i++) {
    const nessusArray = [];
    const cklArray = [];
    const name = selectedFiles[i].name;
    const lastDot = name.lastIndexOf(".");
    const ext = name.substring(lastDot + 1);

    if (ext === "nessus") {
      const reader = new FileReader();
      reader.readAsText(selectedFiles[i]);
      const result = await new Promise((resolve) => {
        reader.onload = function () {
          resolve(reader.result);
        };
      });

      const nessusResult = await processNessus(result, SystemList.value);

      for (let j = 0; j < nessusResult.hostArray.length; j++) {
        if (nessusResult.hostArray[j].systemMatch) {
          // Import Nessus File
          nessusArray.push({
            SystemId: nessusResult.hostArray[j].systemId,
            NessusHostName: nessusResult.hostArray[j].name,
          });
        } else if (nessusResult.hostArray[j].credentialed === "true") {
          const folderLocation = needsInput.value.findIndex((o) => o.folder === name);
          if (folderLocation !== -1) {
            needsInput.value[folderLocation].files.push(nessusResult.hostArray[j]);
          } else {
            needsInput.value.push({ folder: name, files: [nessusResult.hostArray[j]], file: selectedFiles[i] });
          }
        } else if (nessusResult.hostArray[j].credentialed === "false") {
          const folderLocation = notCredentialed.value.findIndex((o) => o.file === name);
          if (folderLocation !== -1) {
            notCredentialed.value[folderLocation].name.push(nessusResult.hostArray[j].name);
          } else {
            notCredentialed.value.push({ file: name, name: [nessusResult.hostArray[j].name] });
          }
        }
      }
      if (nessusArray.length > 0) {
        importNessus = true;
        formdata.append("files", selectedFiles[i]);
        formdata.append("systemsMatchArray", JSON.stringify(nessusArray));
        formdata.append("BoundaryId", boundaryId);
      }
    } else if (ext === "ckl") {
      // For CKL system match
      const reader = new FileReader();
      reader.readAsText(selectedFiles[i]);
      const result = await new Promise((resolve) => {
        reader.onload = function () {
          resolve(reader.result);
        };
      });

      const checklistResult = await processChecklist(result, SystemList.value);
      if (checklistResult.systemMatch && checklistResult.systemId) {
        importCkl = true;
        formdata.append("files", selectedFiles[i]);
        formdata.append("SystemName", checklistResult.systemName);
        formdata.append("BoundaryId", boundaryId);
      } else {
        const folderLocation = needsInput.value.findIndex((o) => o.folder === "Multiple Files");
        if (folderLocation !== -1) {
          needsInput.value[folderLocation].files.push(selectedFiles[i]);
        } else {
          needsInput.value.push({ folder: "Multiple Files", files: [selectedFiles[i]] });
        }
      }
    } else if (ext === "cklb") {
      // For CKL system match
      const reader = new FileReader();
      reader.readAsText(selectedFiles[i]);
      const result = await new Promise((resolve) => {
        reader.onload = function () {
          resolve(reader.result);
        };
      });
      const checklistResult = await processChecklistV3(result, SystemList.value);
      if (checklistResult.systemMatch && checklistResult.systemId) {
        importCkl = true;
        formdata.append("files", selectedFiles[i]);
        formdata.append("SystemName", checklistResult.systemName);
        formdata.append("BoundaryId", boundaryId);
      } else {
        const folderLocation = needsInput.value.findIndex((o) => o.folder === "Multiple Files");
        if (folderLocation !== -1) {
          needsInput.value[folderLocation].files.push(selectedFiles[i]);
        } else {
          needsInput.value.push({ folder: "Multiple Files", files: [selectedFiles[i]] });
        }
      }
    } else {
      const folderLocation = needsInput.value.findIndex((o) => o.folder === "Multiple Files");
      if (folderLocation !== -1) {
        needsInput.value[folderLocation].files.push(selectedFiles[i]);
      } else {
        needsInput.value.push({ folder: "Multiple Files", files: [selectedFiles[i]] });
      }
    }
  }
  if (importNessus || importCkl) {
    await importResult(formdata);
  }
  loading.value = false;

  if (notCredentialed.value.length > 0) {
    nessusWarning.value = true;
  } else if (needsInput.value.length !== 0) {
    selectedSystem.value.length = 0;
    selectedNessusSystems.value.length = 0;
    folderSystem.value.length = 0;
    for (let i = 0; i < needsInput.value.length; i++) {
      selectedSystem.value.push([]);
    }
    userInputModule.value = true;
  }
}
function proceedWithImport() {
  if (needsInput.value.length !== 0) {
    selectedSystem.value.length = 0;
    selectedNessusSystems.value.length = 0;
    folderSystem.value.length = 0;
    for (let i = 0; i < needsInput.value.length; i++) {
      selectedSystem.value.push([]);
    }
    userInputModule.value = true;
  }
}

const saveError = ref(false);

function saveAssignment() {
  saveError.value = false;

  for (let i = 0; i < needsInput.value.length; i++) {
    const name = needsInput.value[i].folder;
    const lastDot = name.lastIndexOf(".");
    const ext = name.substring(lastDot + 1);
    for (let j = 0; j < needsInput.value[i].files.length; j++) {
      if (selectedSystem.value[i][j] === undefined && ext !== "nessus") {
        saveError.value = true;
      }
    }
  }
  if (!saveError.value) {
    const formdata = new FormData();

    for (let i = 0; i < needsInput.value.length; i++) {
      const nessusArray = [];
      for (let j = 0; j < needsInput.value[i].files.length; j++) {
        const name = needsInput.value[i].folder;
        const lastDot = name.lastIndexOf(".");
        const ext = name.substring(lastDot + 1);
        if (ext === "nessus" && selectedSystem.value[i][j] !== undefined) {
          nessusArray.push({
            SystemId: selectedSystem.value[i][j].id,
            NessusHostName: needsInput.value[i].files[j].name,
          });
        } else if (ext !== "nessus") {
          formdata.append("files", needsInput.value[i].files[j]);
          formdata.append("SystemName", selectedSystem.value[i][j].name);
          formdata.append("BoundaryId", boundaryId);
        }
      }
      if (nessusArray.length > 0) {
        // Import Nessus File
        formdata.append("files", needsInput.value[i].file);
        formdata.append("systemsMatchArray", JSON.stringify(nessusArray));
        formdata.append("BoundaryId", boundaryId);
      }
    }

    // if (cklImport) {
    importResult(formdata);
    // }
    // if(nessusImport){
    //   await $fetch("/api/import/results", { method: "POST", body: formdata });
    // }
  }
}

async function importResult(formdata) {
  try {
    userInputModule.value = false;
    loading.value = true;
    loadingProgress.value = 2;
    await $fetch("/api/import/results", { method: "POST", body: formdata });
    loadingProgress.value = 3;
    setTimeout(() => (loading.value = false), 2000);
  } catch (err) {
    loading.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    refreshNuxtData("SummaryAPI");
  }
}

const query = ref("");
const selectedSystem = ref([]);
const folderSystem = ref([]);

const filteredSystems = computed(() =>
  query.value === ""
    ? summary.value.systemView
    : summary.value.systemView.filter((system) => {
        return system.name.toLowerCase().includes(query.value.toLowerCase());
      }),
);

const selectedNessusSystems = ref([]);

const nessusSystems = computed(() =>
  query.value === ""
    ? summary.value.systemView.filter((system) => !selectedNessusSystems.value.includes(system))
    : summary.value.systemView
        .filter((system) => !selectedNessusSystems.value.includes(system))
        .filter((system) => {
          return system.name.toLowerCase().includes(query.value.toLowerCase());
        }),
);
function updateSelection(system, folder, index) {
  const matchIndex = selectedNessusSystems.value.findIndex(
    (selectedSystem) => selectedSystem?.x === folder && selectedSystem?.y === index,
  );
  if (matchIndex !== -1) {
    system.x = folder;
    system.y = index;
    selectedNessusSystems.value[matchIndex] = system;
  } else {
    system.x = folder;
    system.y = index;
    selectedNessusSystems.value.push(system);
  }
}

function updateFolder(folder, system) {
  if (selectedSystem.value[folder].length === 0) {
    for (let i = 0; i < needsInput.value[folder].files.length; i++) {
      selectedSystem.value[folder].push(system);
    }
  } else {
    for (let i = 0; i < needsInput.value[folder].files.length; i++) {
      selectedSystem.value[folder][i] = system;
    }
  }
}

async function exportBoundary() {
  try {
    loadingNotification.value = true;
    loadingMsg.value = "Exporting";
    const queryParams = new URLSearchParams();
    queryParams.append("boundaryId", boundaryId);
    await fetch(`/api/boundaries/export?${queryParams}`, {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/zip" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${boundaryName}-Export.zip`);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      });
    loadingNotification.value = false;
  } catch (err) {
    loadingNotification.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function importBoundary() {
  const fileInput = document.getElementById("importFileBoundary");

  const selectedFiles = fileInput.files;

  const formdata = new FormData();
  formdata.append("files", selectedFiles[0]);
  try {
    loadingNotification.value = true;
    loadingMsg.value = "Importing";
    await $fetch("/api/boundaries/import", {
      method: "POST",
      query: { id: boundaryId },
      body: formdata,
    });
    loadingNotification.value = false;
    reloadNuxtApp();
  } catch (err) {
    loadingNotification.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}
</script>
