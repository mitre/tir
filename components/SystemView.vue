<template>
  <div class="mx-auto max-w-7xl">
    <div class="bg-gray-700/10">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-8 flow-root">
          <div class="-mx-4 sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-0"
                    >
                      {{ assetView.alias }} Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      STIGs Applied
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Finding Status
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-400 dark:divide-gray-800">
                  <tr
                    v-for="system in summary.systemView"
                    :key="system.id"
                    class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-300/5 sm:rounded-lg"
                    @click="[(StigLibraryId = summary.boundaryInfo.StigLibraryId), viewSystem(system)]"
                  >
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-0"
                    >
                      {{ system.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ system.stigsApplied.length }}
                    </td>
                    <td class="flex whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">
                      <div class="flex">
                        <p class="text-green-500">{{ system.findings.NotAFinding }}</p>
                        /
                        <p class="text-red-600">{{ system.findings.Open }}</p>
                        /
                        <p class="text-sky-500">{{ system.findings.Not_Applicable }}</p>
                        /
                        <p class="text-amber-500">{{ system.findings.Not_Reviewed }}</p>
                        <UTooltip
                          v-if="system.override"
                          :ui="{
                            base: 'h-full',
                          }"
                          class="ml-4"
                          :popper="{ placement: 'right' }"
                        >
                          <InformationCircleIcon class="h-5 w-5" />
                          <template #text>
                            <div>
                              <p>This displays raw data.</p>
                              <p>Overrides are not reflected.</p>
                            </div>
                          </template>
                        </UTooltip>
                      </div>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium">
                      <Menu as="div" class="relative">
                        <MenuButton
                          :id="id"
                          class="z-10 -m-2.5 block p-2.5 text-right text-gray-800 hover:text-gray-500 dark:text-gray-100"
                          @click.stop=""
                        >
                          <span class="sr-only">Open options</span>
                          <EllipsisVerticalIcon class="h-6 w-6" aria-hidden="true" />
                        </MenuButton>
                        <transition
                          enter-active-class="transition ease-out duration-100"
                          enter-from-class="transform opacity-0 scale-95"
                          enter-to-class="transform opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-75"
                          leave-from-class="transform opacity-100 scale-100"
                          leave-to-class="transform opacity-0 scale-95"
                        >
                          <MenuItems
                            class="absolute right-0 z-50 mt-0.5 w-32 origin-top-right cursor-pointer divide-y divide-white/20 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-800"
                          >
                            <MenuItem v-slot="{ active }">
                              <a
                                href="#"
                                :class="[
                                  active ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-300',
                                  'group flex items-center px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                                ]"
                                @click="editSystemMenu(system), (open = true)"
                                >Edit<span class="sr-only">, </span></a
                              >
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                              <a
                                :class="[
                                  active
                                    ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300',
                                  'group flex items-center px-3 py-1 text-sm leading-6 text-gray-100',
                                ]"
                                @click.stop="[deleteSystem(system.id)]"
                              >
                                Delete
                              </a>
                            </MenuItem>
                          </MenuItems>
                        </transition>
                      </Menu>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                              @submit.prevent="[editASystemList(), (open = false)]"
                            >
                              <div class="h-0 flex-1 overflow-y-auto">
                                <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                                  <div class="flex items-center justify-between">
                                    <DialogTitle v-if="open" class="text-base font-semibold leading-6 text-white"
                                      >Edit {{ assetView.alias }}</DialogTitle
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
                                      Get started by filling in the information below to edit your
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
                                            v-model="newSystemName"
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
                                            v-model="newHost"
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
                                          >Host IP Address</label
                                        >
                                        <div class="mt-2">
                                          <input
                                            id="project-name"
                                            v-model="newHostIP"
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
                                          <textarea
                                            id="host-mac"
                                            v-model="newHostMac"
                                            name="host-mac"
                                            rows="2"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                          ></textarea>
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
                                            v-model="newHostFqdn"
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
                                            v-model="newTargetComment"
                                            type="text"
                                            name="project-name"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <!-- show if role needs to be edit -->
                                    <Listbox v-model="editSelectedRole" as="div">
                                      <br />
                                      <ListboxLabel
                                        class="block text-sm font-medium leading-6 text-black dark:text-white"
                                        >Roles</ListboxLabel
                                      >
                                      <div class="relative mt-2">
                                        <ListboxButton
                                          class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        >
                                          <span class="inline-flex w-full truncate">
                                            <span class="truncate text-xs">{{ editSelectedRole.name }}</span>
                                          </span>
                                          <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                                          >
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
                                              v-for="item in role"
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
                                                    :class="[
                                                      selected ? 'font-semibold' : 'font-normal',
                                                      'truncate text-xs',
                                                    ]"
                                                    >{{ item.name }}</span
                                                  >
                                                  <!-- <span :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate']">{{ file.date }}</span> -->
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
                                              v-model="newCheckbox"
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
                                            v-if="newCheckbox === true"
                                            id="project-name"
                                            v-model="newSite"
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
                                            v-if="newCheckbox === true"
                                            id="project-name"
                                            v-model="newInstance"
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
                                  Save Changes
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
            </div>
          </div>
        </div>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :error="errorObject"
      :success="success"
      @show="showErrorNotification = false"
    />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel,
} from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";
import { XMarkIcon, ChevronUpDownIcon, CheckIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";

import { useIdStorageStore } from "~~/stores/IdStorage";
const id = useId();

const route = useRoute();
const showErrorNotification = ref(false);
const errorObject = ref();
const success = ref(false);

const store = useIdStorageStore();
const { StigLibraryId } = storeToRefs(store);
const open = ref(false);
const newSystemName = ref("");
const newHost = ref("");
const newHostIP = ref("");
const newHostMac = ref("");
const newHostFqdn = ref("");
const newTargetComment = ref("");
const newSite = ref("");
const newInstance = ref("");
const newCheckbox = ref("");
const systemId = ref();
defineProps({
  summary: {
    type: Object,
    require: true,
    default: () => ({}),
  },
  assetView: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});

// this is for the roles
const role = [
  { id: 1, name: "None" },
  { id: 2, name: "Workstation" },
  { id: 3, name: "Member Server" },
  { id: 4, name: "Domain Controller" },
];
const editSelectedRole = ref(role[0]);
const boundaryId = route.params.boundaryId;

// passing the data into the edit v-model to display the current info
async function editSystemMenu(system) {
  const { data: aSystemList } = await useFetch("/api/systems/listsystem", {
    method: "GET",
    query: { SystemId: system.id },
    watch: false,
  });
  newSystemName.value = aSystemList.value.name;
  systemId.value = system.id;
  newHost.value = aSystemList.value.hostName;
  newHostIP.value = aSystemList.value.hostIP;
  newHostMac.value = aSystemList.value.hostMAC;
  newHostFqdn.value = aSystemList.value.hostFQDN;
  newTargetComment.value = aSystemList.value.targetComment;
  editSelectedRole.value = role[role.findIndex((o) => o.name === aSystemList.value.role)];
  newCheckbox.value = aSystemList.value.webOrDatabase;
  newSite.value = aSystemList.value.webDBSite;
  newInstance.value = aSystemList.value.webDBInstance;
}
// edit the system info
async function editASystemList() {
  try {
    await $fetch("/api/systems/edit", {
      method: "PUT",
      body: {
        name: newSystemName.value,
        BoundaryId: boundaryId,
        SystemId: systemId.value,
        hostName: newHost.value,
        hostIP: newHostIP.value,
        hostMAC: newHostMac.value,
        hostFQDN: newHostFqdn.value,
        targetComment: newTargetComment.value,
        role: editSelectedRole.value.name,
        webOrDatabase: newCheckbox.value,
        webDBSite: newSite.value,
        webDBInstance: newInstance.value,
      },
    });
    errorObject.value = { data: { statusMessage: "Changes Saved Successfully" } };
    success.value = true;
    showErrorNotification.value = true;
    setTimeout(() => {
      showErrorNotification.value = false;
      success.value = false;
    }, 6000);
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    refreshNuxtData("SummaryAPI");
  }
}

async function deleteSystem(id) {
  try {
    await $fetch("/api/systems/delete", {
      method: "POST",
      body: { SystemId: id },
    });
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    refreshNuxtData("SummaryAPI");
  }
}

async function viewSystem(system) {
  await navigateTo({
    path: "/company-boundary/" + boundaryId + "/" + system.id,
  });
}
</script>
