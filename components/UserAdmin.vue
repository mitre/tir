<template>
  <div class="mx-auto max-w-7xl px-4 pb-0 sm:px-6 lg:px-0">
    <div class="rounded-lg bg-white py-4 shadow-lg dark:bg-gray-800">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
          <div class="mx-auto max-w-7xl pt-0 lg:flex lg:gap-x-8 lg:px-0">
            <aside
              class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20"
            >
              <nav class="flex-none px-4 sm:px-6 lg:px-0">
                <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
                  <li v-for="item in secondaryNavigation" :key="item.name">
                    <a
                      :class="[
                        item.current
                          ? 'bg-gray-100 text-indigo-600 dark:bg-gray-50'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-50 dark:hover:text-indigo-600',
                        'group flex cursor-pointer gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6',
                      ]"
                      @click="router.push(item.href)"
                    >
                      <component
                        :is="item.icon"
                        :class="[
                          item.current
                            ? 'text-indigo-600'
                            : 'text-gray-500 group-hover:text-indigo-600 dark:text-gray-100',
                          'h-6 w-6 shrink-0',
                        ]"
                        aria-hidden="true"
                      />
                      {{ item.name }}
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>

            <div class="bg-white dark:bg-gray-800">
              <div class="mx-auto max-w-7xl">
                <div class="mt-6 bg-gray-100 pt-10 dark:bg-gray-900">
                  <div class="px-4 sm:px-6 lg:px-8">
                    <div class="sm:flex sm:items-center">
                      <div class="sm:flex-auto">
                        <h1 class="text-base font-semibold leading-6 text-black dark:text-white">Users</h1>
                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          A list of all the users in your account including their name, title, email and role.
                        </p>
                      </div>
                      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                          <button
                            type="button"
                            class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            @click="[(open = true), (edit = false)]"
                          >
                            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
                            Add Users
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="mt-8 flow-root">
                      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle sm:px-0 lg:px-8">
                          <table class="min-w-full divide-y divide-gray-700">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black dark:text-white sm:pl-4"
                                >
                                  Name
                                </th>
                                <th
                                  scope="col"
                                  class="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-white"
                                >
                                  Role
                                </th>
                                <th
                                  scope="col"
                                  class="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-white"
                                >
                                  Email
                                </th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0"></th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800">
                              <tr v-for="(person, index) in data" :key="person.id">
                                <td
                                  class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black dark:text-white sm:pl-4"
                                >
                                  {{ person.firstName }} {{ person.lastName }}
                                </td>
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {{ person.UserRole.name }}
                                </td>
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {{ person.email }}
                                </td>
                                <td
                                  class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
                                >
                                  <!--3-dot menu bar with delete and edit options -->
                                  <Menu as="div" class="relative ml-auto">
                                    <MenuButton
                                      class="-m-2.5 block p-2.5 text-gray-800 hover:text-gray-500 dark:text-gray-100"
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
                                        class="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-800"
                                      >
                                        <MenuItem v-slot="{ active }">
                                          <a
                                            :class="[
                                              active ? 'bg-gray-200 dark:bg-gray-700' : '',
                                              'block px-3 py-1 text-sm leading-6 text-gray-800 dark:text-gray-100',
                                            ]"
                                            @click="
                                              [
                                                (edit = true),
                                                (open = true),
                                                (editId = person.id),
                                                (newFirstName = person.firstName),
                                                (newLastName = person.lastName),
                                                (newEmail = person.email),
                                                (newRoleId = person.UserRoleId),
                                                (editTimezoneName = timeZones.at(person.TimezoneId - 1)),
                                                (newRoleName = person.UserRole.name),
                                                (selected = person.UserRole),
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
                                              'block px-3 py-1 text-sm leading-6 text-gray-800 dark:text-gray-100',
                                            ]"
                                            @click="
                                              [
                                                (openAlert = true),
                                                (currentId = person.id),
                                                (FN = person.firstName),
                                                (LN = person.lastName),
                                              ]
                                            "
                                            >Delete<span class="sr-only">, </span></a
                                          >
                                        </MenuItem>
                                      </MenuItems>
                                    </transition>
                                  </Menu>
                                  <!-- Delete User Alert -->
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
                                        <div
                                          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
                                        >
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
                                                  <ExclamationTriangleIcon
                                                    class="h-6 w-6 text-red-600"
                                                    aria-hidden="true"
                                                  />
                                                </div>
                                                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                  <DialogTitle
                                                    as="h3"
                                                    class="text-base font-semibold leading-6 text-black dark:text-gray-100"
                                                  >
                                                    Delete {{ FN }} {{ LN }}?</DialogTitle
                                                  >
                                                  <div class="mt-2">
                                                    <p class="text-sm text-gray-600 dark:text-gray-300">
                                                      Are you sure you want to delete this User? All of your data will
                                                      be permanently removed from our servers forever. This action
                                                      cannot be undone.
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button
                                                  type="button"
                                                  class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                                  @click="[(openAlert = false), deleteUser(currentId)]"
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
                                </td>
                              </tr>
                              <!-- Add User Form -->
                              <TransitionRoot as="template" :show="open">
                                <Dialog as="div" class="relative z-10" @close="open = false">
                                  <div class="fixed inset-0" />

                                  <div class="fixed inset-0 overflow-hidden">
                                    <div class="absolute inset-0 overflow-hidden">
                                      <div
                                        class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16"
                                      >
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
                                              @submit.prevent="edit ? editUser() : addUser()"
                                            >
                                              <div class="h-0 flex-1 overflow-y-auto">
                                                <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                                                  <div class="flex items-center justify-between">
                                                    <DialogTitle
                                                      v-if="edit === true"
                                                      class="text-base font-semibold leading-6 text-white"
                                                      >Edit User
                                                    </DialogTitle>
                                                    <DialogTitle
                                                      v-else
                                                      class="text-base font-semibold leading-6 text-white"
                                                      >Add User
                                                    </DialogTitle>
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
                                                    <p v-if="!edit" class="text-sm text-indigo-300">
                                                      Add your users and give them roles
                                                    </p>
                                                    <p v-else class="text-sm text-indigo-300">
                                                      Edit your users and roles
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
                                                          >First Name
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit === true"
                                                            id="project-name"
                                                            v-model="newFirstName"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                          <input
                                                            v-else
                                                            id="project-name"
                                                            v-model="FirstName"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <br />
                                                        <label
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >Last Name
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit === true"
                                                            id="project-name"
                                                            v-model="newLastName"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                          <input
                                                            v-else
                                                            id="project-name"
                                                            v-model="LastName"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <br />
                                                        <label
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >Email
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit === true"
                                                            id="project-name"
                                                            v-model="newEmail"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                          <input
                                                            v-else
                                                            id="project-name"
                                                            v-model="Email"
                                                            required
                                                            type="text"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <br v-if="edit != true" />
                                                        <label
                                                          v-if="edit != true"
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >Set Password
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit != true"
                                                            id="project-name"
                                                            v-model="newPassword"
                                                            required
                                                            type="password"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <!-----------------------------------------UserTimeZone---------------------------------------------------------->
                                                        <br />
                                                        <label
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >TimeZone
                                                        </label>
                                                        <select
                                                          v-if="edit === true"
                                                          id="timezone"
                                                          v-model="editTimezoneName"
                                                          name="timezone"
                                                          class="mt-2 block w-full rounded-md border-0 bg-white/5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:text-white sm:text-sm sm:leading-6 [&_*]:text-black"
                                                          @click="console.log(editTimezoneName)"
                                                        >
                                                          <option v-for="time in timeZones">
                                                            {{ time }}
                                                          </option>
                                                        </select>
                                                        <select
                                                          v-else
                                                          id="timezone"
                                                          v-model="TimezoneName"
                                                          name="timezone"
                                                          class="mt-2 block w-full rounded-md border-0 bg-white/5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:text-white sm:text-sm sm:leading-6 [&_*]:text-black"
                                                          @click="console.log(TimezoneName)"
                                                        >
                                                          <option v-for="time in timeZones">
                                                            {{ time }}
                                                          </option>
                                                        </select>

                                                        <!-----------------------------------------UserRoles---------------------------------------------------------->
                                                        <br />
                                                        <Listbox
                                                          v-if="edit === true"
                                                          v-model="selected"
                                                          class="sm:flex sm:justify-end"
                                                          as="div"
                                                        >
                                                          <ListboxLabel class="sr-only"
                                                            >Change published status
                                                          </ListboxLabel>
                                                          <div class="relative">
                                                            <div
                                                              class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm"
                                                            >
                                                              <div
                                                                class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                                                              >
                                                                <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                                                <p class="text-sm font-semibold">{{ selected.name }}</p>
                                                              </div>
                                                              <ListboxButton
                                                                class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50"
                                                              >
                                                                <span class="sr-only">Change published status</span>
                                                                <ChevronDownIcon
                                                                  class="h-5 w-5 text-white"
                                                                  aria-hidden="true"
                                                                />
                                                              </ListboxButton>
                                                            </div>

                                                            <transition
                                                              leave-active-class="transition ease-in duration-100"
                                                              leave-from-class="opacity-100"
                                                              leave-to-class="opacity-0"
                                                            >
                                                              <ListboxOptions
                                                                class="absolute right-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                              >
                                                                <ListboxOption
                                                                  v-for="option in roles"
                                                                  :key="option.name"
                                                                  v-slot="{ active, selected }"
                                                                  as="template"
                                                                  :value="option"
                                                                >
                                                                  <li
                                                                    :class="[
                                                                      active
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'text-gray-900',
                                                                      'cursor-default select-none p-4 text-sm',
                                                                    ]"
                                                                    @click="[(newRoleId = option.id), (flag = false)]"
                                                                  >
                                                                    <div class="flex flex-col">
                                                                      <div class="flex justify-between">
                                                                        <p
                                                                          :class="
                                                                            selected ? 'font-semibold' : 'font-normal'
                                                                          "
                                                                        >
                                                                          {{ option.name }}
                                                                        </p>
                                                                        <span
                                                                          v-if="selected"
                                                                          :class="
                                                                            active ? 'text-white' : 'text-indigo-600'
                                                                          "
                                                                        >
                                                                          <CheckIcon
                                                                            class="h-5 w-5"
                                                                            aria-hidden="true"
                                                                          />
                                                                        </span>
                                                                      </div>
                                                                      <!-- <p :class="[active ? 'text-indigo-200' : 'text-gray-500', 'mt-2']">{{ option.description }}</p> -->
                                                                    </div>
                                                                  </li>
                                                                </ListboxOption>
                                                              </ListboxOptions>
                                                            </transition>
                                                          </div>
                                                        </Listbox>

                                                        <Listbox
                                                          v-else
                                                          v-model="selected"
                                                          class="sm:flex sm:justify-end"
                                                          as="div"
                                                        >
                                                          <ListboxLabel class="sr-only"
                                                            >Change published status
                                                          </ListboxLabel>
                                                          <div class="relative">
                                                            <div
                                                              class="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm"
                                                            >
                                                              <div
                                                                class="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm"
                                                              >
                                                                <CheckIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                                                <p class="text-sm font-semibold">{{ selected.name }}</p>
                                                              </div>
                                                              <ListboxButton
                                                                class="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50"
                                                              >
                                                                <span class="sr-only">Change published status</span>
                                                                <ChevronDownIcon
                                                                  class="h-5 w-5 text-white"
                                                                  aria-hidden="true"
                                                                />
                                                              </ListboxButton>
                                                            </div>

                                                            <transition
                                                              leave-active-class="transition ease-in duration-100"
                                                              leave-from-class="opacity-100"
                                                              leave-to-class="opacity-0"
                                                            >
                                                              <ListboxOptions
                                                                class="absolute right-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                              >
                                                                <ListboxOption
                                                                  v-for="option in roles"
                                                                  :key="option.name"
                                                                  v-slot="{ active, selected }"
                                                                  as="template"
                                                                  :value="option"
                                                                >
                                                                  <li
                                                                    :class="[
                                                                      active
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'text-gray-900',
                                                                      'cursor-default select-none p-4 text-sm',
                                                                    ]"
                                                                    @click="[(RoleId = option.id)]"
                                                                  >
                                                                    <div class="flex flex-col">
                                                                      <div class="flex justify-between">
                                                                        <p
                                                                          :class="
                                                                            selected ? 'font-semibold' : 'font-normal'
                                                                          "
                                                                        >
                                                                          {{ option.name }}
                                                                        </p>
                                                                        <span
                                                                          v-if="selected"
                                                                          :class="
                                                                            active ? 'text-white' : 'text-indigo-600'
                                                                          "
                                                                        >
                                                                          <CheckIcon
                                                                            class="h-5 w-5"
                                                                            aria-hidden="true"
                                                                          />
                                                                        </span>
                                                                      </div>
                                                                      <!-- <p :class="[active ? 'text-indigo-200' : 'text-gray-500', 'mt-2']">{{ option.description }}</p> -->
                                                                    </div>
                                                                  </li>
                                                                </ListboxOption>
                                                              </ListboxOptions>
                                                            </transition>
                                                          </div>
                                                        </Listbox>
                                                        <!-----------------------------------------Reset Password---------------------------------------------------------->
                                                        <br v-if="edit === true" />
                                                        <label
                                                          v-if="edit === true"
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >New Password
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit === true"
                                                            id="project-name"
                                                            v-model="newReset"
                                                            type="password"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <br v-if="edit === true" />
                                                        <label
                                                          v-if="edit === true"
                                                          for="project-name"
                                                          class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                                                          >Confirm Password
                                                        </label>
                                                        <div class="mt-2">
                                                          <input
                                                            v-if="edit === true"
                                                            id="project-name"
                                                            v-model="newConfirm"
                                                            type="password"
                                                            name="project-name"
                                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                          />
                                                        </div>
                                                        <br />
                                                        <div
                                                          v-if="
                                                            edit === true &&
                                                            newReset &&
                                                            newConfirm &&
                                                            newReset !== newConfirm
                                                          "
                                                          class="text-sm text-red-500"
                                                        >
                                                          Passwords Do Not Match!
                                                        </div>
                                                        <!-- <div
                                                          v-else="edit === true && newReset && newConfirm && newReset === newConfirm"
                                                          class="text-green-500">
                                                          Pw Do match!
                                                        </div> -->
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
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ErrorNotification
      v-if="showErrorNotification"
      :show="showErrorNotification"
      :msg="errorMsg"
      @show="showErrorNotification = false"
    />
  </div>
</template>

<script setup>
import { CheckIcon, ChevronDownIcon, PlusIcon, EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";
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
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
} from "@heroicons/vue/24/outline";

import { storeToRefs } from "pinia";
import { useUserListStore } from "~~/stores/UserList";
const timeZones = Intl.supportedValuesOf("timeZone");
const open = ref(false);
const openAlert = ref(false);
const FirstName = ref();
const LastName = ref();
const Email = ref("");
const Reset = ref();
const Confirm = ref();
const TimezoneName = ref(timeZones.at(1));
const currentId = ref(null);
const RoleId = ref(1);
const { data: currentUser } = await useFetch("/api/auth/currentUser");
// edit varibles
const editId = ref("");
const newFirstName = ref("");
const newLastName = ref("");
const newEmail = ref("");
const newReset = ref("");
const newConfirm = ref("");
const newPassword = ref("");
const newRoleId = ref(0);
const newRoleName = ref();
const flag = ref(true);
const editTimezoneName = ref();
const router = useRouter();
// const pwSucess = ref(false);
const showErrorNotification = ref(false);
const errorMsg = ref();
const store2 = useUserListStore();
const { deleteUserList } = store2;
const { UserList } = storeToRefs(store2);
function addUsers(UserName, currentDate) {
  if (UserName.length === 0) {
    return;
  }
  // invokes function in the store:
  store2.addUserList(UserName, currentDate);
}
//
const refreshAll = async () => {
  await refreshNuxtData();
};
//
const { data } = await useFetch("/api/users");
const { data: roles } = await useFetch("/api/users/roles");
const selected = ref(roles.value[0]);

//

async function addUser() {
  try {
    await $fetch("/api/users/create", {
      method: "POST",
      body: {
        firstName: FirstName.value,
        lastName: LastName.value,
        email: Email.value,
        reset: Reset.value,
        confirm: Confirm.value,
        UserRoleId: RoleId.value,
        TimezoneName: TimezoneName.value,
      },
    });
    await $fetch("/api/auth/setPW", {
      method: "POST",
      body: {
        email: Email.value,
        password: newPassword.value,
      },
    });
    open.value = false;
    location.reload();
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function deleteUser(UserId) {
  //  console.log(UserId);
  try {
    await useFetch("/api/users/delete", {
      method: "POST",
      body: { id: UserId },
    });
  } finally {
    location.reload();
  }
}

async function editUser() {
  try {
    await $fetch("/api/users/edit", {
      method: "PUT",
      body: {
        id: editId.value,
        firstName: newFirstName.value,
        lastName: newLastName.value,
        email: newEmail.value,
        UserRoleId: newRoleId.value,
        timezone: editTimezoneName.value,
      },
    });
    if (newReset.value && newConfirm.value && newReset.value === newConfirm.value) {
      const pwData = {
        email: newEmail.value,
        password: newReset.value,
      };
      console.log("updating PW for:", pwData.email);
      await useFetch("/api/auth/setPW", {
        method: "POST",
        body: {
          email: newEmail.value,
          password: newReset,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("The Password was updated successfully");
    } else if (newReset.value || newConfirm.value) {
      console.log("PassWord do not match or are empty");
    }
    open.value = false;
    location.reload();
  } catch (err) {
    errorMsg.value = err.data.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

const secondaryNavigation = [
  { name: "General", href: "/administration/general", icon: UserCircleIcon, current: false },
  { name: "Configuration", href: "/administration/configuration", icon: WrenchIcon, current: false },
  { name: "Notifications", href: "#", icon: BellIcon, current: false },
  { name: "Users", href: "/administration/team-members", icon: UsersIcon, current: true },
  { name: "Logs", href: "/administration/logs", icon: DocumentDuplicateIcon, current: false },
];
</script>
