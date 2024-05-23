<template>
  <main class=" ">
    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div>
        <main>
          <header>
            <!-- Secondary navigation -->
            <nav class="z-50 flex border-b border-black/10 py-4 dark:border-white/10">
              <ul
                class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8"
              >
                <li>
                  <a
                    href="#"
                    Class="text-indigo-600 dark:text-indigo-400 px-6 hover:text-gray-800 dark:hover:text-white"
                    >Overview</a
                  >

                  <Popover class="relative inline-flex">
                    <PopoverButton :id="id" class="hover:text-gray-800 dark:hover:text-white">
                      Add System
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
                              v-for="(item, index) in solutions"
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
                            <div class="cursor-pointer rounded-2xl">
                              <label class="group flex items-center gap-x-2 rounded-2xl">
                                <div
                                  class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white dark:bg-gray-700"
                                >
                                  <FolderArrowDownIcon
                                    class="h-6 w-6 text-gray-800 dark:text-gray-200"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  class="mr-1 items-center justify-center font-semibold text-gray-800 dark:text-white"
                                >
                                  CSV File

                                  <!-- <p class="mt-1 text-gray-300">{{ item.description }}</p> -->
                                </div>
                                <div />
                              </label>
                            </div>
                          </div>
                          <!-- <div class="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                            <a v-for="item in callsToAction" :key="item.name" :href="item.href"
                              class="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100">
                              <component :is="item.icon" class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                              {{ item.name }}
                            </a>
                          </div> -->
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>

                  <a href="#" class="relative inline-flex pl-6 pt-2 hover:text-gray-800 dark:hover:text-white"
                    >Import Results
                    <span
                      class="absolute -right-0 -top-2 inline-flex items-center rounded-md bg-gray-400/10 px-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
                      >MVP2</span
                    >
                  </a>
                  <a href="#" class="relative inline-flex pl-6 pt-2 hover:text-gray-800 dark:hover:text-white"
                    >Statistics
                    <span
                      class="absolute -right-0 -top-2 inline-flex items-center rounded-md bg-gray-400/10 px-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
                      >MVP3</span
                    >
                  </a>
                  <a href="#" class="pl-6 hover:text-gray-800 dark:hover:text-white" @click="showExport = true"
                    >Export Data</a
                  >
                  <a href="#" class="relative inline-flex pl-6 pt-2 hover:text-gray-800 dark:hover:text-white"
                    >SCTM
                    <span
                      class="absolute -right-0 -top-2 inline-flex items-center rounded-md bg-gray-400/10 px-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
                      >MVP3</span
                    >
                  </a>
                </li>
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
                    <span class="cursor-pointer font-semibold text-gray-800 dark:text-white"
                      ><a @click="[router.push('/boundaries/' + $route.params.boundary + 'id' + $route.params.id)]">{{
                        $route.params.boundary
                      }}</a></span
                    >

                    <span class="text-gray-600">/</span>
                    <span class="cursor-pointer font-semibold text-gray-800 dark:text-white"
                      ><a @click="reloadNuxtApp()">{{ $route.params.details }}</a></span
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
              <div
                v-for="(stat, statIdx) in stats"
                :key="stat.name"
                :class="[
                  statIdx % 3 === 1
                    ? 'sm:border-l'
                    : statIdx === 5
                      ? 'sm:border-l'
                      : statIdx === 2
                        ? 'lg:border-l'
                        : statIdx === 3
                          ? 'sm:border-l'
                          : '',
                  'border-t border-black/5 px-4 py-6 dark:border-white/5 sm:px-6 lg:px-8',
                ]"
              >
                <div class="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  {{ stat.name }}
                  <div
                    v-if="statIdx === 1"
                    v-show="hover1"
                    class="inline-flex items-center rounded-md bg-green-500/10 px-2 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20"
                  >
                    Not a Finding
                  </div>
                  <div
                    v-if="statIdx === 1"
                    v-show="hover2"
                    class="inline-flex items-center rounded-md bg-red-500/10 px-2 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20"
                  >
                    Open
                  </div>
                  <div
                    v-if="statIdx === 1"
                    v-show="hover3"
                    class="inline-flex items-center rounded-md bg-sky-500/10 px-2 text-xs font-medium text-sky-400 ring-1 ring-inset ring-sky-500/20"
                  >
                    Not Applicable
                  </div>
                  <div
                    v-if="statIdx === 1"
                    v-show="hover4"
                    class="inline-flex items-center rounded-md bg-amber-500/10 px-2 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20"
                  >
                    Not Reviewed
                  </div>
                </div>
                <div class="mt-2 items-baseline gap-x-2">
                  <span
                    v-if="statIdx === 2"
                    class="break-all text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
                    >{{ stat.value }}</span
                  >
                  <span
                    v-else-if="statIdx === 1"
                    class="mt-2 flex text-xl font-normal tracking-tight text-gray-600 dark:text-white"
                  >
                    <p class="mr-6 text-sm text-gray-900 dark:text-gray-400">{{ stat.unit }}</p>
                    <p
                      class="cursor-pointer text-green-500 hover:text-green-700"
                      @mouseover="hover1 = true"
                      @mouseleave="hover1 = false"
                    >
                      {{ stat.value.NotAFinding }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-red-600 hover:text-red-700"
                      @mouseover="hover2 = true"
                      @mouseleave="hover2 = false"
                    >
                      {{ stat.value.Open }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-sky-500 hover:text-sky-700"
                      @mouseover="hover3 = true"
                      @mouseleave="hover3 = false"
                    >
                      {{ stat.value.Not_Applicable }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-amber-500 hover:text-amber-700"
                      @mouseover="hover4 = true"
                      @mouseleave="hover4 = false"
                    >
                      {{ stat.value.Not_Reviewed }}
                    </p>
                  </span>

                  <span v-else class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{{
                    stat.value
                  }}</span>
                  <span
                    v-if="stat.value2"
                    class="flex text-xl font-normal tracking-tight text-gray-600 dark:text-white"
                  >
                    <p class="mr-2 text-sm text-gray-900 dark:text-gray-400">{{ stat.unit2 }}</p>
                    <p
                      class="cursor-pointer text-green-500 hover:text-green-700"
                      @mouseover="hover1 = true"
                      @mouseleave="hover1 = false"
                    >
                      {{ stat.value2.NotAFinding }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-red-600 hover:text-red-700"
                      @mouseover="hover2 = true"
                      @mouseleave="hover2 = false"
                    >
                      {{ stat.value2.Open }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-sky-500 hover:text-sky-700"
                      @mouseover="hover3 = true"
                      @mouseleave="hover3 = false"
                    >
                      {{ stat.value2.Not_Applicable }}
                    </p>
                    /
                    <p
                      class="cursor-pointer text-amber-500 hover:text-amber-700"
                      @mouseover="hover4 = true"
                      @mouseleave="hover4 = false"
                    >
                      {{ stat.value2.Not_Reviewed }}
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </header>

          <!-- Views -->
          <div>
            <div class="hidden sm:block">
              <div class="border-b border-gray-200">
                <nav class="-mb-px flex cursor-pointer space-x-8" aria-label="Tabs">
                  <a
                    v-for="(tab, index) in tabs"
                    :key="tab.name"
                    :class="[
                      currentTab[index]
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                    ]"
                    :aria-current="currentTab[index] ? 'page' : undefined"
                    @click="[currentTab.fill(false), (currentTab[index] = true), router.push(tab.href)]"
                    >{{ tab.name }}</a
                  >
                </nav>
              </div>
            </div>

            <NuxtPage />
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
                    @submit.prevent="addSystem()"
                  >
                    <div class="h-0 flex-1 overflow-y-auto">
                      <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                        <div class="flex items-center justify-between">
                          <DialogTitle class="text-base font-semibold leading-6 text-white">New System</DialogTitle>
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
                            Get started by filling in the information below to create your new system.
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
                                >System name</label
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
                        @click="[(open = false)]"
                      >
                        <!-- @click="[refreshSystem()]" -->
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
                class="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
              >
                <div>
                  <div class="flex h-7 items-center">
                    <button
                      type="button"
                      class="rounded-md bg-gray-900 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      @click="loading = false"
                    >
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div class="text-center">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-white"
                      >Creating Systems
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

    <!-- <Export v-if="showExport" :showExport="showExport" :entityId="TierId" entityType="Tier" commonName="Company" :nameProp="nameProp" @openClose="openMembers = false"/> -->
    <!-- <Export v-if="showExport" :open="showExport" :entityId=parseInt($route.params.id) @openClose="showExport = false"/> -->
    <Export
      v-if="showExport"
      :open="showExport"
      :boundaryId="search"
      :boundaryName="boundaryName"
      @showExport="showExport = false"
    />
    <QuickAdd
      v-if="openWidget"
      :openMembers="openWidget"
      :boundaryId="search"
      :libraryId="libraryId"
      @openClose="[(openWidget = false), refreshSystem()]"
    />
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :msg="errorMsg"
      @show="showErrorNotification = false"
    />
  </main>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/vue";
import {
  XMarkIcon,
  CursorArrowRaysIcon,
  SquaresPlusIcon,
  FolderArrowDownIcon,
  FolderOpenIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { useQuickAddStore } from "~~/stores/QuickAdd";
import { useIdStorageStore } from "~~/stores/IdStorage";
const id = useId();
const storeID = useIdStorageStore();
const { BoundaryId } = storeToRefs(storeID);
const { Summary } = storeToRefs(storeID);

const loading = ref(false);
const route = useRoute();
const router = useRouter();
const systemName = ref("");
// const { data } = await useFetch("/api/boundaries");
const hover1 = ref(false);
const hover2 = ref(false);
const hover3 = ref(false);
const hover4 = ref(false);
const boundaryList = {
  TierId: route.params.id,
};
const showErrorNotification = ref(false);
const errorMsg = ref();

const { data } = await useFetch("/api/boundaries/list", {
  method: "POST",
  body: boundaryList,
});
const dbvalue = data.value.findIndex((o) => o.name === route.params.details);
const search = data.value[dbvalue].id;
const boundaryName = data.value[dbvalue].name;

BoundaryId.value = search;
// console.log('Search', search)
async function addSystem() {
  try {
    await $fetch("/api/systems/create", {
      method: "POST",
      body: {
        name: systemName.value,
        BoundaryId: search,
      },
    });
    // console.log(error);
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    refreshSystem();
  }
}
/// Add System

const open = ref(false);
const showExport = ref(false);
/// End

/// Current View
const currentTab = ref([false, false]);
if (
  decodeURIComponent(route.fullPath).substring(decodeURIComponent(route.fullPath).lastIndexOf("/") + 1) ===
  "BoundaryView-" + search
) {
  currentTab.value[0] = true;
} else if (
  decodeURIComponent(route.fullPath).substring(decodeURIComponent(route.fullPath).lastIndexOf("/") + 1) === "SystemView"
) {
  currentTab.value[1] = true;
}

/// // Boundary Summary
const { data: summary } = await useFetch("/api/boundaries/summary", {
  method: "GET",
  query: { BoundaryId: search },
  key: "SummaryAPI",
});

storeID.Summary = summary;

const { data: rmfLibrary } = await useFetch("/api/boundaries/listRMFVersions");
const policyDocument =
  rmfLibrary.value[rmfLibrary.value.findIndex((o) => o.id === data.value[dbvalue].PolicyDocumentId)];

async function refreshSystem() {
  const { data: summary } = await useFetch("/api/boundaries/summary", {
    method: "GET",
    query: { BoundaryId: search },
    watch: false,
  });
  storeID.Summary = summary;
  stats.value = [
    { name: "Number of Systems", value: summary.value.systemView.length },
    {
      name: "Status",
      value: summary.value.totalCounts,
      unit: "Total:",
      value2: summary.value.uniqueCounts,
      unit2: "Unique:",
    },
    { name: "STIG baseline", value: data.value[dbvalue].StigLibrary.filename },
    { name: "NIST version", value: policyDocument.title },
    { name: "Overlay Selected", value: data.value[dbvalue].overlaySelected },
    { name: "Control Status", value: "0/0 Met" },
  ];
  systemName.value = "";
  // location.reload();
}

const stats = ref([
  { name: "Number of Systems", value: summary.value.systemView.length },
  {
    name: "Status",
    value: summary.value.totalCounts,
    unit: "Total:",
    value2: summary.value.uniqueCounts,
    unit2: "Unique:",
  },
  { name: "STIG baseline", value: data.value[dbvalue].StigLibrary.filename },
  { name: "NIST version", value: policyDocument.title },
  { name: "Overlay Selected", value: data.value[dbvalue].overlaySelected },
  { name: "Control Status", value: "0/0 Met" },
]);
const tabs = [
  {
    name: "Boundary View",
    href:
      "/boundaries/" +
      route.params.boundary +
      "id" +
      route.params.id +
      "/" +
      route.params.details +
      "/BoundaryView" +
      "-" +
      search,
    current: currentTab.value[0],
  },
  {
    name: "System View",
    href: "/boundaries/" + route.params.boundary + "id" + route.params.id + "/" + route.params.details + "/SystemView",
    current: currentTab.value[1],
  },
];

/// //// Quick Add
const libraryId = ref(data.value[dbvalue].StigLibraryId);
const openWidget = ref(false);
function setOpen(index) {
  if (index === 0) {
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
  console.log("CKL Import Start");
  loading.value = true;
  let folder = ref();
  let nextFolder = ref();
  let selectedFiles = ref();
  let systemName = ref();
  let nextSystemName = ref();

  if (isZip) {
    const fileInputS = document.getElementById("uploadZip");
    selectedFiles = fileInputS.files;

    folder = selectedFiles[0].name.split(".zip");
    systemName = folder[0];
    const formdata = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formdata.append("files", selectedFiles[i]);
    }

    try {
      formdata.append("SystemName", systemName);
      formdata.append("BoundaryId", search);
      await $fetch("/api/import/results", { method: "POST", body: formdata });
      await refreshNuxtData("SystemStigList");
    } catch (err) {
      errorMsg.value = err.data.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  } else {
    const fileInputS = document.getElementById("uploadFolder");
    selectedFiles = fileInputS.files;
    const formdata = new FormData();
    formdata.append("BoundaryId", search);

    for (let i = 0; i < selectedFiles.length; i++) {
      if (i === 0) {
        folder = selectedFiles[i].webkitRelativePath.split("/");
        if (folder.length === 3) {
          systemName = folder[1];
        } else {
          systemName = folder[0];
        }
      } else {
        nextFolder = selectedFiles[i].webkitRelativePath.split("/");
        nextSystemName = nextFolder[1];
      }
      if (nextFolder.length === 3 && nextSystemName !== systemName) {
        try {
          await $fetch("/api/systems/create", {
            method: "POST",
            body: { name: systemName, BoundaryId: search },
          });
          await useFetch("/api/import/results", { method: "POST", body: formdata });
          await refreshNuxtData("SystemStigList");
        } catch (err) {
          errorMsg.value = err.data.statusMessage;
          showErrorNotification.value = true;
          setTimeout(() => (showErrorNotification.value = false), 6000);
        }

        formdata.delete("files");
        formdata.delete("SystemId");
        formdata.append("files", selectedFiles[i]);
        systemName = nextFolder[1];
      } else {
        formdata.append("files", selectedFiles[i]);
      }
      if (i === selectedFiles.length - 1) {
        try {
          await $fetch("/api/systems/create", {
            method: "POST",
            body: { name: systemName, BoundaryId: search },
          });
          await useFetch("/api/import/results", { method: "POST", body: formdata });
          await refreshNuxtData("SystemStigList");
        } catch (err) {
          errorMsg.value = err.data.statusMessage;
          showErrorNotification.value = true;
          setTimeout(() => (showErrorNotification.value = false), 6000);
        }
      }
    }
  }

  console.log("Checklist Done");
  refreshSystem();
  // location.reload()
  loading.value = false;
}

async function getSystemId(systemName) {
  const { data: SystemList } = await useFetch("/api/systems/list", {
    method: "POST",
    body: { boundary: search },
  });
  const systemId = SystemList.value[SystemList.value.findIndex((o) => o.name === systemName)].id;

  return systemId;
}

const solutions = [
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
</script>
