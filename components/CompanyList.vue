<template>
  <div class="rounded-lg bg-white py-12 shadow-lg dark:bg-gray-800">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4
            v-if="get.length != 0"
            class="mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl"
          >
            {{ get[0].name }}
          </h4>
          <h4 v-else class="mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
            Companies
          </h4>
          <h4 class="mt-1 text-lg text-gray-800 dark:text-white">Select your company to view relevant boundaries.</h4>
        </div>

        <div v-show="currentUser.UserRole.name === 'User'" class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="open = true"
          >
            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
            Company
          </button>
          <button
            v-if="tierList.length === 0"
            type="button"
            class="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="[editCompany(), router.push('/boundaries/' + get[0].name + 'id' + get[0].id)]"
          >
            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
            Boundary
          </button>
        </div>
      </div>
      <div
        class="mx-auto my-5 grid grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      ></div>

      <!-- Breadcrumb -->
      <nav class="flex pb-5" aria-label="Breadcrumb">
        <ol role="list" class="flex items-center space-x-4">
          <li>
            <div>
              <a
                class="cursor-pointer text-gray-400 hover:text-gray-300 dark:text-gray-200 dark:hover:text-gray-500"
                @click="[(pages.length = 0), (tierId = null)]"
              >
                <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span class="sr-only">Home</span>
              </a>
            </div>
          </li>
          <!-- pages.slice(0, -1) -->
          <li v-for="page in pages" :key="page.name">
            <div class="flex items-center">
              <ChevronRightIcon class="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-200" aria-hidden="true" />
              <a
                :href="'#'"
                class="ml-4 cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300 dark:text-gray-200 dark:hover:text-gray-500"
                @click="[(pages.length = pagePosition(page.tierId) + 1), (tierId = page.tierId)]"
                >{{ page.name }}</a
              >
            </div>
          </li>
        </ol>
      </nav>
      <ul role="list" class="divide-y divide-black/5 rounded-md bg-gray-200 dark:divide-white/5 dark:bg-gray-900">
        <li
          v-for="company in tierList"
          :key="company.id"
          class="relative flex items-center space-x-4 py-4 hover:bg-gray-300 dark:hover:bg-gray-950"
        >
          <div class="min-w-0 flex-auto px-5">
            <div class="flex items-center gap-x-3">
              <h2 class="text-md min-w-0 font-semibold leading-6 text-gray-800 dark:text-white">
                <!-- @click="
                    [
                    uniqueCompany(company.id, company.name, company.parentId),

                      company.hasBoundaries
                        ? router.push('/boundaries/' + company.name + 'id' + company.id)
                        : (tierId = company.id),
                    ]
                  " -->
                <a
                  class="flex cursor-pointer gap-x-2"
                  @click="[checkTier(company.id, company.hasBoundaries, company.name, company.parentId)]"
                >
                  <span class="truncate">{{ company.name }}</span>
                  <span class="absolute inset-0" />
                </a>
              </h2>
            </div>
            <div class="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
              <p class="whitespace-nowrap">Added: {{ company.createdAt }}</p>
            </div>
          </div>
          <Menu as="div" class="relative ml-auto">
            <MenuButton
              class="-m-2.5 block p-2.5 text-gray-800 hover:text-gray-500 hover:text-gray-500 dark:text-gray-100"
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
                class="absolute right-0 z-10 mt-0.5 w-32 origin-top-right divide-y divide-black/20 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:divide-white/20 dark:bg-gray-800"
              >
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-200 dark:bg-gray-700' : '',
                      'block px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                    ]"
                    @click="
                      [
                        (edit = true),
                        (open = true),
                        ownerEdit(company.ownerId),
                        (editCompanyName = company.name),
                        (editId = company.id),
                      ]
                    "
                    >Edit<span class="sr-only">, </span></a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-200 dark:bg-gray-700' : '',
                      'block px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                    ]"
                    @click="[(openMembers = true), (TierId = company.id), (nameProp = company.name)]"
                    >Manage Members<span class="sr-only">, </span></a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-200 dark:bg-gray-700' : '',
                      'block px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                    ]"
                    @click="[(openAlert = true), (errorName = company.name), (deleteId = company.id)]"
                    >Delete<span class="sr-only">, </span></a
                  >
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>

          <!-- Delete Company Alert -->
          <TransitionRoot as="template" :show="openAlert">
            <Dialog as="div" class="relative z-10" @close="openAlert = false">
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
                      class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                    >
                      <div class="sm:flex sm:items-start">
                        <div
                          class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-gray-100 dark:bg-gray-800 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <DialogTitle
                            as="h3"
                            class="text-base font-semibold leading-6 text-gray-800 dark:text-gray-100"
                          >
                            Delete {{ errorName }}?</DialogTitle
                          >
                          <div class="mt-2">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Are you sure you want to delete this company? All of your data will be permanently removed
                              from our servers forever. This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                          @click="[(openAlert = false), removeCompany(deleteId)]"
                        >
                          Delete
                        </button>
                        <button
                          ref="cancelButtonRef"
                          type="button"
                          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          @click="openAlert = false"
                        >
                          Cancel
                        </button>
                      </div>
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </div>
            </Dialog>
          </TransitionRoot>
        </li>
      </ul>

      <!-- Add Company Form -->
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
                  <DialogPanel class="pointer-events-auto w-screen max-w-xs">
                    <form
                      class="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:bg-gray-800"
                      @submit.prevent="edit ? '' : addCompany(companyData)"
                    >
                      <div class="h-0 flex-1 overflow-y-auto">
                        <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                          <div class="flex items-center justify-between">
                            <DialogTitle v-if="edit" class="text-base font-semibold leading-6 text-white">
                              Edit Company</DialogTitle
                            >
                            <DialogTitle v-else class="text-base font-semibold leading-6 text-white">
                              Add Company</DialogTitle
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
                            <p v-if="edit" class="text-sm text-indigo-300">Edit your company and save changes.</p>
                            <p v-else class="text-sm text-indigo-300">Add your company to start creating boundaries.</p>
                          </div>
                        </div>
                        <div class="flex flex-1 flex-col justify-between">
                          <div class="divide-y divide-gray-200 px-4 sm:px-6">
                            <div class="space-y-6 pb-5 pt-6">
                              <div>
                                <label
                                  for="project-name"
                                  class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                  >Company Name
                                </label>
                                <div class="mt-2">
                                  <input
                                    v-if="edit"
                                    id="project-name"
                                    v-model="editCompanyName"
                                    required
                                    type="text"
                                    name="project-name"
                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                  <input
                                    v-else
                                    id="project-name"
                                    v-model="companyName"
                                    required
                                    type="text"
                                    name="project-name"
                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <label
                                  v-if="edit"
                                  for="project-name"
                                  class="mt-4 block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                  >Company Owner
                                </label>
                                <div v-if="edit" class="mt-2">
                                  <Combobox v-model="selectedPerson" as="div" class="w-full">
                                    <div class="relative flex">
                                      <ComboboxInput
                                        class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        :display-value="(user) => user?.email"
                                        @change="[(query = $event.target.value)]"
                                      />
                                      <ComboboxButton
                                        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                                      >
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                      </ComboboxButton>

                                      <ComboboxOptions
                                        v-if="filteredPeople.length > 0"
                                        class="fixed z-10 mt-10 max-h-60 max-w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                      >
                                        <ComboboxOption
                                          v-for="user in filteredPeople"
                                          :key="user.id"
                                          v-slot="{ active, selected }"
                                          :value="user"
                                          as="template"
                                        >
                                          <li
                                            :class="[
                                              'relative cursor-pointer select-none py-2 pl-3 pr-9',
                                              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                            ]"
                                          >
                                            <div class="flex">
                                              <span :class="['truncate', selected && 'font-semibold']">
                                                {{ user.firstName }} {{ user.lastName }}
                                              </span>
                                              <span
                                                :class="[
                                                  'ml-2 truncate text-gray-500',
                                                  active ? 'text-indigo-200' : 'text-gray-500',
                                                ]"
                                              >
                                                {{ user.email }}
                                              </span>
                                            </div>

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
                              </div>
                              <!-- Current Member List -->
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          @click="open = false"
                        >
                          Cancel
                        </button>
                        <button
                          v-if="edit"
                          type="submit"
                          class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          @click="[updateEditDetails(), (open = false)]"
                        >
                          Save
                        </button>
                        <button
                          v-else
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
    </div>
  </div>

  <Members
    v-if="openMembers"
    :openMembers="openMembers"
    :entityId="TierId"
    entityType="Tier"
    commonName="Company"
    :nameProp="nameProp"
    @openClose="openMembers = false"
  />
  <ErrorNotification
    v-if="showErrorNotification"
    :show="showErrorNotification"
    :msg="errorMsg"
    @show="showErrorNotification = false"
  />
</template>

<script setup>
import { PlusIcon, EllipsisVerticalIcon, ChevronRightIcon, HomeIcon, CheckIcon } from "@heroicons/vue/20/solid";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";
import { XMarkIcon, ExclamationTriangleIcon, ChevronUpDownIcon } from "@heroicons/vue/24/outline";

import { storeToRefs } from "pinia";
import { useBreadcrumbStore } from "~~/stores/Breadcrumb";
const showErrorNotification = ref(false);
const errorMsg = ref();
const errorName = ref("");
const router = useRouter();
const open = ref(false);
const openAlert = ref(false);
const companyName = ref();
const editCompanyName = ref(companyName);
const deleteId = ref();
// const tierId = ref(null)
const edit = ref(false);
const openMembers = ref(false);
const TierId = ref(0);
const nameProp = ref("");
const store = useBreadcrumbStore();

const { pages } = storeToRefs(store);
const { tierId } = storeToRefs(store);
function addBreadcrumb(pageInfo) {
  // invokes function in the store:
  store.addBreadcrumb(pageInfo);
}
function deleteBreadcrumb(parentId) {
  // invokes function in the store:
  store.deleteBreadcrumb(parentId);
}
/// ////////////////////////////////DB Functions
const companyList = {
  parentId: tierId,
};
const companyDetails = {
  id: tierId,
};
// const tierList = ref()
// const get = ref();

const { data: tierList, error } = await useFetch("/api/tiers/list", {
  method: "POST",
  body: companyList,
  key: "tierListAPI",
});

async function checkTier(id, hasBoundaries, companyName, parentId) {
  const { data: tierCheck, error: listError } = await useFetch("/api/tiers/list", {
    method: "POST",
    body: { parentId: id },
  });

  const { data: getCheck, error: getError } = await useFetch("/api/tiers/get", {
    method: "POST",
    body: { id },
  });

  if (listError.value === null && getError.value === null) {
    uniqueCompany(id, companyName, parentId);
    if (hasBoundaries) {
      router.push("/boundaries/" + companyName + "id" + id);
    } else {
      tierId.value = id;
    }
  } else {
    if (listError.value !== null) {
      errorMsg.value = listError.value.statusMessage;
    } else {
      errorMsg.value = getError.value.statusMessage;
    }

    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

const { data: get } = await useFetch("/api/tiers/get", {
  method: "POST",
  body: companyDetails,
});

pages.value.length = pagePosition(tierId.value) + 1;
/// //////////////////////////////////
const { data: currentUser } = await useFetch("/api/auth/currentUser");
const companyData = {
  name: companyName,
  parentId: tierId,
  ownerId: currentUser.value.id,
};

async function addCompany(companyData) {
  try {
    await useFetch("/api/tiers/create", {
      method: "POST",
      body: companyData,
    });
  } finally {
    location.reload();
  }
}
/// /////////////////////////////////

// let editCompanyPkg = ref();
const editId = ref();
async function updateEditDetails() {
  const editCompanyPkg = {
    id: editId,
    name: editCompanyName,
    ownerId: selectedPerson.value.id,
  };
  try {
    const { error } = await useFetch("/api/tiers/edit", {
      method: "PUT",
      body: editCompanyPkg,
      watch: false,
    });
    if (error.value != null) {
      errorMsg.value = error.value.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    } else {
      console.log("Good");
    }
  } finally {
    refreshNuxtData("tierListAPI");
  }
}

async function editCompany() {
  const companyEdit = {
    id: tierId.value,
    hasBoundaries: true,
  };
  try {
    await useFetch("/api/tiers/edit", {
      method: "PUT",
      body: companyEdit,
    });
  } finally {
    // location.reload()
  }
}
/// ////////////////////////////////////

async function removeCompany(companyId) {
  try {
    const { error } = await useFetch("/api/tiers/remove", {
      method: "POST",
      body: { id: companyId },
    });

    if (error.value != null) {
      errorMsg.value = error.value.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    } else {
      console.log("Good");
    }
  } finally {
    refreshNuxtData("tierListAPI");
  }
}

function pagePosition(tierId) {
  const position = pages.value.findIndex((o) => o.tierId === tierId);
  return position;
}
function uniqueCompany(id, name, parentId) {
  if (pages.value.findIndex((o) => o.tierId === id) === -1) {
    if (pages.value.findIndex((o) => o.parentId === parentId) !== -1) {
      deleteBreadcrumb(parentId);
      addBreadcrumb({ name: name, tierId: id, parentId: parentId });
    } else {
      addBreadcrumb({ name: name, tierId: id, parentId: parentId });
    }
  } else {
    console.log("Not unique ID");
  }
}
const selectedPerson = ref(null);
// const filteredPeople = ref();
const query = ref("");
const { data: users } = await useFetch("/api/users");
const filteredUsers = users.value.filter((o) => o.UserRoleId === 2);
const filteredPeople = computed(() =>
  query.value === ""
    ? filteredUsers
    : filteredUsers.filter((user) => {
        return (
          user.firstName.toLowerCase().includes(query.value.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.value.toLowerCase())
        );
      }),
);

function ownerEdit(ownerId) {
  selectedPerson.value = filteredUsers.find((o) => o.id === ownerId);
}
</script>
