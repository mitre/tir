<!-- eslint-disable vue/first-attribute-linebreak -->
<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-lg bg-white py-6 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <main class="px-4 sm:px-6 lg:flex-auto lg:px-0">
          <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div class="sm:flex-auto">
              <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                  <a class="flex cursor-pointer text-indigo-500 hover:text-indigo-400" @click="backButton()">
                    <ArrowUturnLeftIcon class="mr-2 h-5 w-5" />
                    <p>Back</p>
                  </a>

                  <h4 class="mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
                    {{ route.params.system }}
                  </h4>
                </div>
                <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <!-- <label class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold
                                            text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                                            focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                        <span class="inline-flex items-center">
                                            <PlusIcon class="-ml-0.5 mr-1 h-5 w-5 bg-indigo-500 rounded-md "
                                                aria-hidden="true" />
                                            Checklist
                                        </span>
                                        <input ref="fileInputS" id="upload" name="files[]" type='file' multiple
                                            @change="handleChecklistChange()" class="hidden" />

                                    </label> -->
                  <div class="inline-flex text-right">
                    <Menu as="div" v-slot="{ open }" class="relative inline-block text-left">
                      <div>
                        <MenuButton
                          class="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
                          Results
                        </MenuButton>
                      </div>

                      <transition
                        enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0"
                      >
                        <div v-show="open">
                          <MenuItems
                            static
                            class="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-500 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-700"
                          >
                            <div class="px-1 py-1">
                              <MenuItem v-slot="{ active }">
                                <button
                                  :class="[
                                    active ? 'bg-indigo-500 text-white' : 'text-gray-800 dark:text-white',
                                    'group flex w-full items-center rounded-md  text-sm',
                                  ]"
                                >
                                  <label class="w-full cursor-pointer pb-1 pt-2">
                                    <span class="inline-flex items-center">
                                      <FolderPlusIcon :active="active" class="mr-2 h-5 w-5" aria-hidden="true" />
                                      Import Folder
                                    </span>
                                    <input
                                      id="uploadFolder"
                                      ref="fileInputFolder"
                                      name="files[]"
                                      type="file"
                                      webkitdirectory
                                      multiple
                                      class="hidden"
                                      @change="handleChecklistChangeFolder()"
                                    />
                                  </label>
                                </button>
                              </MenuItem>
                            </div>
                            <div class="px-1 py-1">
                              <MenuItem v-slot="{ active }">
                                <button
                                  :class="[
                                    active ? 'bg-indigo-500 text-white' : 'text-gray-800 dark:text-white',
                                    'group flex w-full items-center rounded-md  text-sm',
                                  ]"
                                >
                                  <label class="w-full cursor-pointer pb-1 pt-2">
                                    <span class="inline-flex items-center">
                                      <ArchiveBoxArrowDownIcon
                                        :active="active"
                                        class="mr-2 h-5 w-5"
                                        aria-hidden="true"
                                      />
                                      Import ZIP Folder
                                    </span>
                                    <input
                                      id="uploadZip"
                                      ref="fileInputZip"
                                      name="files[]"
                                      type="file"
                                      class="hidden"
                                      @change="handleZip()"
                                    />
                                  </label>
                                </button>
                              </MenuItem>
                            </div>
                            <div class="px-1 py-1">
                              <MenuItem v-slot="{ active }">
                                <button
                                  :class="[
                                    active ? 'bg-indigo-500 text-white' : 'text-gray-800 dark:text-white',
                                    'group flex w-full items-center rounded-md  text-sm',
                                  ]"
                                >
                                  <label class="w-full cursor-pointer pb-1 pt-2">
                                    <span class="inline-flex items-center">
                                      <CursorArrowRippleIcon :active="active" class="mr-2 h-5 w-5" aria-hidden="true" />
                                      Multiple File Selection
                                    </span>
                                    <input
                                      id="uploadMultiple"
                                      ref="fileInputMultiple"
                                      name="files[]"
                                      type="file"
                                      multiple
                                      class="hidden"
                                      @change="handleChecklistChange()"
                                    />
                                  </label>
                                </button>
                              </MenuItem>
                            </div>
                          </MenuItems>
                        </div>
                      </transition>
                    </Menu>
                  </div>
                  <button
                    class="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="open = true"
                  >
                    <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
                    STIG
                  </button>
                </div>
              </div>
              <div
                class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
              ></div>
              <div class="mt-8 flow-root">
                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div class="overflow-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table class="min-w-full divide-y divide-gray-800">
                        <thead class="bg-gray-200 dark:bg-gray-900">
                          <tr>
                            <th
                              scope="col"
                              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-6"
                            >
                              STIG Name
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Version
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Last Update
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Finding Status
                            </th>
                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800 bg-gray-200 dark:bg-gray-900">
                          <tr
                            v-for="stig in systemStigList"
                            :key="stig.id"
                            class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-950 sm:rounded-lg"
                            @click="
                              [
                                (loading = true),
                                (StigId = stig.Stig_System.StigId),
                                (SystemId = stig.Stig_System.SystemId),
                                (BoundaryName = route.params.enclave),
                                navigateTo(
                                  '/boundaries/' +
                                    route.params.boundary +
                                    'id' +
                                    route.params.id +
                                    '/SystemView/' +
                                    route.params.system +
                                    '/' +
                                    encodeURIComponent(stig.title),
                                ),
                              ]
                            "
                          >
                            <td
                              class="break-word py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-6"
                            >
                              {{ stig.title }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">
                              v{{ stig.version }}r{{ stig.stigRelease }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">
                              {{ stig.stigDate }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">
                              {{ stig.updatedAt }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">
                              <span
                                v-if="getStatus(stig.finding_status)"
                                v-for="(find, index) in getStatus(stig.finding_status)"
                                :key="find"
                              >
                                <span
                                  :class="[
                                    index === 0
                                      ? 'text-green-500'
                                      : index === 1
                                        ? 'text-red-500'
                                        : index === 2
                                          ? 'text-sky-500'
                                          : index === 3
                                            ? 'text-amber-500'
                                            : 'text-gray-200',
                                  ]"
                                  >{{ find
                                  }}<span v-if="index != 3" class="text-gray-800 dark:text-gray-200">/</span></span
                                >
                              </span>
                              <!-- <div v-if="getStatus(stig.finding_status)" class="flex">
                                                                <p class="text-green-500">{{getStatus(stig.finding_status)[0]}}<span class="text-gray-200">/</span></p>
                                                                <p class="text-red-600">{{getStatus(stig.finding_status)[1]}}<span class="text-gray-200">/</span></p>
                                                                <p class="text-gray-200">{{getStatus(stig.finding_status)[2]}}<span class="text-gray-200">/</span></p>
                                                                <p class="text-gray-200">{{getStatus(stig.finding_status)[3]}}</p> -->
                              <!-- <p v-for="(find,index) in getStatus(stig.finding_status)" >
                                                                    <p :class="[(index===0)? 'text-green-500': (index===1)? 'text-red-500': 'text-gray-200'  ]">{{find}}<span v-if="index!=3" class="text-gray-200">/</span></p> 
                                                                </p> -->
                              <!-- </div> -->
                              <div v-else class="flex">
                                <p class="text-gray-800 dark:text-gray-200">View STIG</p>
                              </div>
                              <!-- test(stig.Stig_System.StigId, stig.Stig_System.SystemId) findingStatus -->
                            </td>
                            <td
                              class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                            >
                              <button
                                type="button"
                                @click.stop="removeStigApi(stig.Stig_System.StigId, stig.Stig_System.SystemId)"
                                class="font-semibold text-indigo-600 hover:text-indigo-500"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Side menu popup -->
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
                        <div class="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:bg-gray-800">
                          <!-- @sumbmit.prevent="addStig(stigData)" -->
                          <!-- @submit.prevent="addSystem(systemData) -->
                          <div class="h-0 flex-1 overflow-y-auto">
                            <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                              <div class="flex items-center justify-between">
                                <DialogTitle class="text-base font-semibold leading-6 text-white"
                                  >Add STIGs</DialogTitle
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
                                <p class="text-sm text-indigo-300">Apply STIGs below to your system.</p>
                              </div>
                            </div>
                            <div class="flex flex-1 flex-col justify-between">
                              <div class="divide-y divide-gray-200 px-4 sm:px-6">
                                <div class="space-y-6 pb-5 pt-6">
                                  <div>
                                    <!-- Compnent 2  -->
                                    <div class="py-6">
                                      <label
                                        for="project-name"
                                        class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                        >Apply STIGs</label
                                      >
                                      <Combobox>
                                        <div class="relative">
                                          <MagnifyingGlassIcon
                                            class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                          />
                                          <ComboboxInput
                                            class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder:text-gray-400 focus:ring-0 dark:text-gray-200 sm:text-sm"
                                            placeholder="Search..."
                                            @change="query = $event.target.value"
                                          />
                                        </div>

                                        <div
                                          v-if="query === ''"
                                          class="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14"
                                        >
                                          <GlobeAmericasIcon class="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                                          <p class="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                                            Search for STIGS
                                          </p>
                                          <p class="mt-2 text-gray-400">
                                            Quickly add STIGS for your system by running a search.
                                          </p>
                                        </div>

                                        <ComboboxOptions
                                          v-if="filteredItems.length > 0"
                                          static
                                          class="max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2"
                                        >
                                          <li v-for="[category, stigList] in Object.entries(groups)" :key="category">
                                            <!-- <h2 class="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
                                                            {{ category }}
                                                        </h2> -->
                                            <ul class="mt-2 text-sm font-normal text-gray-800 dark:text-gray-200">
                                              <ComboboxOption
                                                v-for="item in stigList"
                                                :key="item.id"
                                                :value="item"
                                                v-slot="{ active }"
                                                as="template"
                                              >
                                                <li
                                                  :class="[
                                                    'cursor-pointer select-none px-4 py-2',
                                                    active && 'bg-indigo-600 text-white',
                                                  ]"
                                                  @click="[addTempStig(item.id, item.title)]"
                                                >
                                                  {{ item.title }}
                                                </li>
                                              </ComboboxOption>
                                            </ul>
                                          </li>
                                        </ComboboxOptions>

                                        <div
                                          v-if="query !== '' && filteredItems.length === 0"
                                          class="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14"
                                        >
                                          <FaceFrownIcon class="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                                          <p class="mt-4 font-semibold text-gray-900">No results found</p>
                                          <p class="mt-2 text-gray-500">
                                            We couldn’t find anything with that term. Please try again.
                                          </p>
                                        </div>
                                      </Combobox>
                                    </div>
                                  </div>
                                </div>
                                <div class="pb-6 pt-4">
                                  <label
                                    for="project-name"
                                    class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                    >Applied STIGs:</label
                                  >
                                  <!-- Table -->
                                  <ul
                                    role="list"
                                    class="max-h-96 scroll-pb-2 scroll-pt-11 divide-y divide-white/5 overflow-y-auto"
                                  >
                                    <li
                                      v-for="stig in tempStore.TempStigList"
                                      :key="stig.StigId"
                                      class="relative flex items-center space-x-4 py-2 hover:bg-gray-500/10"
                                    >
                                      <div class="flex items-center gap-x-5">
                                        <button @click="[deleteTempStig(stig.StigId)]">
                                          <XMarkIcon class="h-6 w-6 text-gray-400 hover:text-white" />
                                        </button>
                                        <h2
                                          class="flex min-w-0 text-sm font-normal leading-6 text-gray-800 dark:text-gray-200"
                                        >
                                          <a class="flex gap-x-2">
                                            <span>{{ stig.name }}</span>
                                          </a>
                                        </h2>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
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
                              @click="[addStig(stigData), (open = false)]"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </div>
            </Dialog>
          </TransitionRoot>
        </main>
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
                    class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
                  >
                    <div>
                      <div class="flex h-7 items-center">
                        <button
                          type="button"
                          class="rounded-md bg-gray-100 text-black hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-900 dark:text-indigo-200"
                          @click="loading = false"
                        >
                          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div class="text-center">
                        <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white">
                          Loading Assessment
                        </DialogTitle>
                        <div class="mb-12 mt-2">
                          <p class="text-sm text-gray-800 dark:text-white">Please Wait...</p>
                        </div>
                        <div class="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2">
                          <svg
                            class="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                            viewBox="0 0 24 24"
                          ></svg>
                        </div>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </TransitionRoot>
        <TransitionRoot as="template" :show="loadingCKL">
          <Dialog as="div" class="relative z-10" @close="loadingCKL = false">
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
                    class="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
                  >
                    <div>
                      <div class="flex h-7 items-center">
                        <button
                          type="button"
                          class="rounded-md bg-gray-900 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          @click="loadingCKL = false"
                        >
                          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div class="text-center">
                        <DialogTitle as="h3" class="text-base font-semibold leading-6 text-white">
                          Adding STIGs
                        </DialogTitle>
                        <div class="mb-12 mt-2">
                          <p class="text-sm text-white">Please Wait...</p>
                        </div>
                        <div class="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2">
                          <svg
                            class="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                            viewBox="0 0 24 24"
                          ></svg>
                        </div>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </TransitionRoot>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :msg="errorMsg"
      @show="showErrorNotification = false"
    />
  </div>

  <!-- :openStig="openStig" -->
</template>

<script setup>
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import {
  FaceFrownIcon,
  GlobeAmericasIcon,
  XMarkIcon,
  FolderPlusIcon,
  CursorArrowRippleIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/vue/24/outline";
import { ArrowUturnLeftIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/vue/20/solid";
import { storeToRefs } from "pinia";
import { useTempStigListStore } from "~~/stores/TempStigList";
import { useIdStorageStore } from "~~/stores/IdStorage";
const route = useRoute();
const loading = ref(false);
const loadingCKL = ref(false);
const tempStore = useTempStigListStore();
const { TempStigList } = tempStore;
const showErrorNotification = ref(false);
const errorMsg = ref();
const store = useIdStorageStore();
const { BoundaryId } = storeToRefs(store);
const { StigLibraryId } = storeToRefs(store);
const { StigId } = storeToRefs(store);
const { SystemId } = storeToRefs(store);
const { BoundaryName } = storeToRefs(store);
const { assessmentId } = storeToRefs(store);
assessmentId.value = 0;
const { selectedFilterStore } = storeToRefs(store);
selectedFilterStore.value = [];

async function backButton() {
  await navigateTo(
    "/boundaries/" + route.params.boundary + "id" + route.params.id + "/" + route.params.enclave + "/SystemView",
  );
}

const open = ref(false);

const query = ref("");
const filteredItems = computed(() =>
  query.value === ""
    ? []
    : stigList.value.filter((item) => {
        return item.title.toLowerCase().includes(query.value.toLowerCase());
      }),
);
const groups = computed(() =>
  filteredItems.value.reduce((groups, item) => {
    return { ...groups, [item.category]: [...(groups[item.category] || []), item] };
  }, {}),
);

function onSelect(item) {
  window.location = item.url;
}

const stigs = {
  StigLibraryId,
};

const { data: stigList } = await useFetch("/api/stig/library/list", {
  method: "POST",
  body: stigs,
});

const boundarySelect = {
  boundary: BoundaryId,
};

const { data: systemInfo } = await useFetch("/api/systems/list", {
  key: "SystemInfo",
  method: "POST",
  body: boundarySelect,
});
const systemValue = systemInfo.value.findIndex((o) => o.name === route.params.system);
const searchId = systemInfo.value[systemValue].id;
// console.log(searchId)
// console.log(route.params)

function addTempStig(stigID, stigName) {
  console.log("LOGGING");
  if (tempStore.TempStigList.findIndex((o) => o.StigId === stigID) === -1) {
    tempStore.addTempStigList(stigID, searchId, stigName);
  }
}
function deleteTempStig(StigId) {
  tempStore.deleteTempStigList(StigId);
}

const currentSystem = {
  SystemId: searchId,
};

const { data: systemStigList } = await useFetch("/api/systems/stig/list", {
  key: "SystemStigList",
  method: "POST",
  body: currentSystem,
});
// console.log('System Stig List 1',systemStigList.value)
// function updateStigData(){
// const stigData = {
//   "StigId": 4,
//   "SystemId": 19
// }
// console.log('HERE', stigData)
// return stigData
// }
function addStig() {
  let stigData;
  for (let i = 0; i < tempStore.TempStigList.length; i++) {
    stigData = {
      StigId: tempStore.TempStigList[i].StigId,
      SystemId: tempStore.TempStigList[i].SystemId,
      BoundaryId: BoundaryId.value,
    };
    addStigApi(stigData);
  }
  tempStore.TempStigList.length = 0;
}

async function addStigApi(stigData) {
  try {
    // console.log("Staring Stig")
    await $fetch("/api/systems/stig/add", {
      method: "POST",
      body: stigData,
    });
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    await refreshNuxtData("SystemStigList");
  }
}

async function removeStigApi(stigId, systemId) {
  try {
    await $fetch("/api/systems/stig/remove", {
      method: "POST",
      body: { StigId: stigId, SystemId: systemId, BoundaryId: BoundaryId.value },
    });
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    await refreshNuxtData("SystemStigList");
  }
}
///  Import Checklist

async function handleChecklistChangeFolder() {
  loadingCKL.value = true;
  const fileInputS = document.getElementById("uploadFolder");
  const selectedFiles = fileInputS.files;
  const formdata = new FormData();

  for (let i = 0; i < selectedFiles.length; i++) {
    formdata.append("files", selectedFiles[i]);
    formdata.append("SystemId", currentSystem.SystemId);
    formdata.append("BoundaryId", BoundaryId.value);
  }
  try {
    await $fetch("/api/import/results", { method: "POST", body: formdata });
    await refreshNuxtData("SystemStigList");
    console.log("Checklist Done");
    location.reload();
  } catch (err) {
    loadingCKL.value = false;
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    // displayNotification("STIG Library Upload", "Completed upload of STIG library.",false);
    loadingCKL.value = false;
  }
}

async function handleZip() {
  loadingCKL.value = true;
  const fileInputS = document.getElementById("uploadZip");

  const selectedFiles = fileInputS.files;
  const formdata = new FormData();

  formdata.append("files", selectedFiles[0]);
  formdata.append("SystemId", currentSystem.SystemId);
  formdata.append("BoundaryId", BoundaryId.value);

  //   const result = await useFetch("/api/import/checklist", { method: "POST", body: formdata });
  try {
    await $fetch("/api/import/results", { method: "POST", body: formdata });
    await refreshNuxtData("SystemStigList");
    console.log("Zip Done");
    location.reload();
  } catch (err) {
    loadingCKL.value = false;
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    // displayNotification("STIG Library Upload", "Completed upload of STIG library.",false);
    loadingCKL.value = false;
  }
}

async function handleChecklistChange() {
  loadingCKL.value = true;
  const fileInputS = document.getElementById("uploadMultiple");
  // console.log(fileInputS)
  const selectedFiles = fileInputS.files;
  // var filename = fileInputS.files[0].name;
  // console.log('File Name', selectedFiles)

  // displayNotification("Checklist Uploading", "Starting upload of STIG library.",false);
  const formdata = new FormData();
  // formdata.append('file', fileInputS.files[0]);
  // formdata.append('SystemId', currentSystem.SystemId);
  for (let i = 0; i < selectedFiles.length; i++) {
    formdata.append("files", selectedFiles[i]);
  }
  formdata.append("SystemId", currentSystem.SystemId);
  formdata.append("BoundaryId", BoundaryId.value);
  // console.log('Form Data', ...formdata)
  //   const result = await useFetch("/api/import/checklist", { method: "POST", body: formdata });
  try {
    await $fetch("/api/import/results", { method: "POST", body: formdata });
    await refreshNuxtData("SystemStigList");
    console.log("Checklist Done");
    location.reload();
  } catch (err) {
    loadingCKL.value = false;
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    // displayNotification("STIG Library Upload", "Completed upload of STIG library.",false);
    loadingCKL.value = false;
  }
}

///////// Finding Status

function getStatus(findingStatus) {
  // console.log('Finding Status',findingStatus)

  if (findingStatus != null) {
    const openStatus = findingStatus.filter((item) => {
      return item.status.includes("Open");
    });
    const notAFindingStatus = findingStatus.filter((item) => {
      return item.status.includes("NotAFinding");
    });
    const notApplicableStatus = findingStatus.filter((item) => {
      return item.status.includes("Not_Applicable");
    });
    const notReviewed = findingStatus.filter((item) => {
      return item.status.includes("Not_Reviewed");
    });
    if (openStatus.length === 0) {
      openStatus[0] = { status: "Open", count: "0" };
    }
    if (notAFindingStatus.length === 0) {
      notAFindingStatus[0] = { status: "NotAFinding", count: "0" };
    }
    if (notApplicableStatus.length === 0) {
      notApplicableStatus[0] = { status: "Not_Applicable", count: "0" };
    }
    if (notReviewed.length === 0) {
      notReviewed[0] = { status: "Not_Reviewed", count: "0" };
    }
    const finalStatus = [];
    finalStatus.push(
      notAFindingStatus[0].count,
      openStatus[0].count,
      notApplicableStatus[0].count,
      notReviewed[0].count,
    );
    // console.log('Final Status',finalStatus)
    return finalStatus;
  }
}

// console.log(findingStatus)
// })
</script>
