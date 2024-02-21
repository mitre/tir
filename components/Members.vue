<template>
  <TransitionRoot as="template" :show="openMembers">
    <Dialog as="div" class="relative z-10" @close="[$emit('openClose', false), reloadNuxtApp({ ttl: 100 })]">
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

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              class="relative max-w-4xl transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:p-6"
            >
              <div>
                <h1 class="block text-lg font-light leading-6 text-gray-800 dark:text-white">
                  {{ nameProp }} Members:
                </h1>
                <h1 class="mt-1 flex text-sm font-light text-gray-800 dark:text-white">
                  <UsersIcon class="mr-2 h-5 w-5 text-gray-800 dark:text-gray-100" aria-hidden="true" />Total Members:
                  {{ entityList.length + 1 }}
                </h1>
                <div v-show="editMemberList">
                  <div class="max-w-contents mt-8 flex rounded-md">
                    <div class="text-md self-center font-light text-gray-800 dark:text-white">Search Users:</div>
                    <div class="relative flex flex-grow items-stretch pl-8 focus-within:z-10">
                      <Combobox v-model="selectedPerson" as="div" class="w-full">
                        <div class="relative flex">
                          <ComboboxInput
                            class="w-full rounded-l-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                            class="max-w-content fixed z-10 mt-10 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
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
                    <!-- Role Type Dropdown -->
                    <Listbox v-model="memberType" as="div">
                      <div class="relative pr-24">
                        <div class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
                          <div class="inline-flex items-center gap-x-1.5 bg-indigo-600 px-3 py-2 text-white shadow-sm">
                            <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            <p class="text-sm font-semibold">{{ memberType.name }}</p>
                          </div>
                          <ListboxButton
                            class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50"
                          >
                            <ChevronDownIcon class="h-5 w-5 text-white" aria-hidden="true" />
                          </ListboxButton>
                        </div>

                        <transition
                          leave-active-class="transition ease-in duration-100"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <ListboxOptions
                            class="absolute z-10 mt-2 w-36 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <ListboxOption
                              v-for="option in Roles"
                              :key="option.id"
                              v-slot="{ active, selected }"
                              as="template"
                              :value="option"
                            >
                              <li
                                :class="[
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'cursor-pointer select-none p-4 text-sm',
                                ]"
                              >
                                <div class="flex flex-col">
                                  <div class="flex justify-between">
                                    <p :class="selected ? 'font-semibold' : 'font-normal'">{{ option.name }}</p>
                                    <span v-if="selected" :class="active ? 'text-white' : 'text-indigo-600'">
                                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  </div>
                                </div>
                              </li>
                            </ListboxOption>
                          </ListboxOptions>
                        </transition>
                      </div>
                    </Listbox>
                  </div>
                  <div class="py-2 text-center">
                    <button
                      :disabled="!editMemberList"
                      type="button"
                      class="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      @click="[addMembers()]"
                    >
                      <UserPlusIcon class="h-4 w-4 rounded-md" aria-hidden="true" />
                      Add Member
                    </button>
                    <transition
                      enter-active-class="transform ease-out duration-300 transition"
                      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                      leave-active-class="transition ease-in duration-300"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <div v-if="userError" class="animate-fade pt-2 text-sm text-red-500">
                        <ExclamationTriangleIcon class="inline-block h-4 w-4" aria-hidden="true" /> Member already
                        added.
                      </div>
                    </transition>
                  </div>
                </div>
                <div class="mt-2 flow-root">
                  <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table class="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-0"
                            >
                              Name
                            </th>

                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Role
                            </th>
                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                              <span class="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="max-h-16 divide-y divide-gray-800 overflow-y-auto">
                          <tr>
                            <td
                              class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-0"
                            >
                              {{ data.owner.firstName }} {{ data.owner.lastName }}
                            </td>

                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {{ data.owner.email }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">Owner</td>
                          </tr>

                          <tr v-for="(entityUser, index) in entityList" :key="entityUser.UserId">
                            <td
                              class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-0"
                            >
                              {{ entityUser.User.firstName }} {{ entityUser.User.lastName }}
                            </td>

                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {{ entityUser.User.email }}
                            </td>
                            <td
                              v-if="edit && index === editIndex"
                              class="whitespace-nowrap px-0 py-4 text-sm text-gray-600 dark:text-gray-300"
                            >
                              <Listbox v-model="selected" as="div">
                                <div class="relative">
                                  <ListboxButton
                                    class="w-small relative cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                  >
                                    <span class="block truncate">{{ selected.name }}</span>
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
                                        v-for="person in Roles"
                                        :key="person.id"
                                        v-slot="{ active, selected }"
                                        as="template"
                                        :value="person"
                                      >
                                        <li
                                          :class="[
                                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                            'relative cursor-pointer select-none py-2 pl-3 pr-9',
                                          ]"
                                        >
                                          <span
                                            :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']"
                                            >{{ person.name }}</span
                                          >

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
                            </td>
                            <td v-else class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {{ entityUser[entityRole].name }}
                            </td>
                            <td
                              v-show="editMemberList"
                              class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
                            >
                              <a
                                v-if="edit && index === editIndex"
                                href="#"
                                class="text-indigo-400 hover:text-indigo-300"
                                @click="[editMembers(entityUser.User.id), (edit = false)]"
                                >Save</a
                              >
                              <a
                                v-else
                                href="#"
                                class="text-indigo-400 hover:text-indigo-300"
                                @click="[updateSelected(entityUser[entityRole].id), (editIndex = index), (edit = true)]"
                                >Edit</a
                              >
                              <a
                                href="#"
                                class="pl-4 text-red-500 hover:text-red-400"
                                @click="removeMembers(entityUser.User.id)"
                                >Remove</a
                              >
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 text-center">
                <button
                  type="button"
                  class="w-sm inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="[$emit('openClose', false), reloadNuxtApp({ ttl: 100 })]"
                >
                  Back to {{ pluralCommon }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { ChevronDownIcon, UsersIcon, UserPlusIcon } from "@heroicons/vue/20/solid";
import inflection from "inflection";

const props = defineProps({
  openMembers: {
    type: Boolean,
    required: true,
  },
  entityId: {
    type: Number,
    required: true,
  },
  nameProp: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  commonName: {
    type: String,
    required: true,
  },
});
const { openMembers, entityId, nameProp, entityType, commonName } = props;
/// //Table Info

const pluarlEntity = inflection.pluralize(inflection.camelize(props.entityType, true));
const baseUrl = computed(() => `/api/${pluarlEntity}`);
const pluralCommon = inflection.pluralize(props.commonName);

const { data } = await useFetch(`${baseUrl.value}/users/list`, {
  key: "memberList",
  method: "GET",
  query: { [`${entityType}Id`]: entityId },
  // body: {[`${entityType}Id`]: entityId }
});

const entityList = ref(data.value[`${entityType}_Users`]);
const entityRole = `${entityType}Role`;

/// /////////// Add Users

const { data: users } = await useFetch("/api/users");
const { data: Roles } = await useFetch(`${baseUrl.value}/users/getRole`);
const filteredUsers = users.value.filter((o) => o.UserRoleId === 2);

const query = ref("");
const selectedPerson = ref(null);
const memberType = ref(Roles.value[0]);
let userError = ref(false);

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

async function addMembers() {
  try {
    if (entityList.value.findIndex((o) => o.User.id === selectedPerson.value.id) !== -1) {
      userError = true;
      setAlertTimeout();
    } else {
      const memberData = {
        UserId: selectedPerson.value.id,
        [`${entityType}Id`]: entityId,
        [`${entityType}RoleId`]: memberType.value.id,
      };
      await useFetch(`${baseUrl.value}/users/add`, {
        method: "POST",
        body: memberData,
      });
    }
  } finally {
    await refreshNuxtData("memberList");
    entityList.value = data.value[`${entityType}_Users`];
  }
}
/// ///////////////// Remove users

async function removeMembers(userId) {
  try {
    const removeData = {
      UserId: userId,
      [`${entityType}Id`]: entityId,
    };
    await useFetch(`${baseUrl.value}/users/remove`, {
      method: "POST",
      body: removeData,
    });
    await refreshNuxtData("memberList");
    entityList.value = data.value[`${entityType}_Users`];
  } finally {
    // await refreshNuxtData(count)
  }
}

/// //////// Edit Users
async function editMembers(userId) {
  try {
    const editData = {
      UserId: userId,
      [`${entityType}Id`]: entityId,
      [`${entityType}RoleId`]: selected.id,
    };
    await useFetch(`${baseUrl.value}/users/edit`, {
      method: "PUT",
      body: editData,
    });
  } finally {
    await refreshNuxtData("memberList");
    entityList.value = data.value[`${entityType}_Users`];
  }
}
const edit = ref(false);
let selected = ref();
function updateSelected(userId) {
  console.log(`${entityType} Role ID ${userId}`);
  selected = Roles.value[Roles.value.findIndex((o) => o.id === userId)];
  console.log("selected", selected);
}

/// /// Alert
function setAlertTimeout() {
  setTimeout(hideNotification, 3000);
}

function hideNotification() {
  userError = false;
  refreshNuxtData("memberList");
}

// Check Member Permissions
// async function currentMember() {
const editMemberList = ref("false");
const { data: user } = await useFetch("/api/auth/currentUser", { method: "GET" });

if (data.value.ownerId === user.value.id || user.value.UserRole.name === "Admin") {
  editMemberList.value = true;
} else if (data.value.Tier_Users) {
  if (data.value.Tier_Users.findIndex((o) => o.UserId === user.value.id) !== -1) {
    const memberIndex = data.value.Tier_Users.findIndex((o) => o.UserId === user.value.id);
    const currentRole = data.value.Tier_Users[memberIndex].TierRole.name;
    if (currentRole === "Co-Owner") {
      editMemberList.value = true;
    } else {
      editMemberList.value = false;
    }
  } else {
    editMemberList.value = false;
  }
} else if (data.value.Boundary_Users) {
  if (data.value.Boundary_Users.findIndex((o) => o.UserId === user.value.id) !== -1) {
    const memberIndex = data.value.Boundary_Users.findIndex((o) => o.UserId === user.value.id);
    const currentRole = data.value.Boundary_Users[memberIndex].BoundaryRole.name;
    if (currentRole === "Co-Owner") {
      editMemberList.value = true;
    } else {
      editMemberList.value = false;
    }
  } else {
    editMemberList.value = false;
  }
} else {
  editMemberList.value = false;
}
</script>
