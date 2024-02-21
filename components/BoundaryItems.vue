<template>
  <div class="rounded-lg bg-white py-12 shadow-lg dark:bg-gray-800">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="mt-1 text-xl font-bold text-gray-800 dark:text-white">{{ $route.params.company }}</h1>
          <h1 class="mt-1 text-lg text-gray-800 dark:text-white">A list of all the boundaries you are a member of.</h1>
        </div>
        <div v-show="currentUser.UserRole.name === 'User'" class="ml-16 mt-4">
          <button
            type="button"
            class="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="[(open = true), (edit = false)]"
          >
            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md bg-indigo-500" aria-hidden="true" />
            <span>Enclave</span>
          </button>
        </div>
      </div>
      <!-- Breadcrumb -->
      <nav class="flex py-5" aria-label="Breadcrumb">
        <ol role="list" class="flex items-center space-x-4">
          <li>
            <div>
              <a
                href="/company-boundaries"
                class="cursor-pointer text-gray-400 hover:text-gray-300 dark:text-gray-200 dark:hover:text-gray-500"
                @click="[(pages.length = 0), (tierId = null)]"
              >
                <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span class="sr-only">Home</span>
              </a>
            </div>
          </li>
          <!-- pages..slice(0, -1) -->
          <li v-for="(page, index) in pages" :key="page.name">
            <div class="flex items-center">
              <ChevronRightIcon class="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-200" aria-hidden="true" />
              <a
                v-if="index === pages.length - 1"
                :href="'#'"
                class="ml-4 cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300 dark:text-gray-200 dark:hover:text-gray-500"
                @click="[(pages.length = pagePosition(page.tierId) + 1), (tierId = page.tierId)]"
                >{{ page.name }}</a
              >
              <a
                v-else
                href="/company-boundaries"
                :href="'#'"
                class="ml-4 cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300 dark:text-gray-200 dark:hover:text-gray-500"
                @click="[(pages.length = pagePosition(page.tierId) + 1), (tierId = page.tierId)]"
                >{{ page.name }}</a
              >
            </div>
          </li>
        </ol>
      </nav>

      <div class="flow-root">
        <div class="rounded-lg bg-gray-200 py-2 shadow ring-1 ring-black ring-opacity-5 dark:bg-gray-900">
          <table class="min-w-full divide-y divide-gray-400 dark:divide-gray-800">
            <thead class="bg-gray-200 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-6"
                >
                  Name
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  # of Systems
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Owner
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Creation Date
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Last Update
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">options</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-400 bg-gray-200 dark:divide-gray-800 dark:bg-gray-900">
              <tr
                v-for="enclave in data"
                :key="enclave.id"
                class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-950 sm:rounded-lg"
                @click="checkPermissions(enclave.id, enclave.name)"
              >
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-6">
                  {{ enclave.name }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-200">
                  {{ enclave.systemCount }}
                </td>
                <td
                  v-if="enclave.owner != null"
                  class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-200"
                >
                  {{ enclave.owner.email }}
                </td>
                <td v-else class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-200">None</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-200">Need Data</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-200">
                  {{ enclave.lastUpdate }}
                </td>
                <td class="relative flex whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Menu as="div" class="relative ml-auto">
                    <MenuButton
                      class="z-10 -m-2.5 block p-2.5 text-gray-800 hover:text-gray-500 dark:text-gray-100"
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
                        class="absolute right-0 z-50 mt-0.5 w-48 origin-top-right divide-y divide-black/20 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:divide-white/20 dark:bg-gray-800"
                      >
                        <!-- <div class="py-1">
                              <MenuItem v-slot="{ active }">
                              <a @click="router.push('/boundaries/'+ route.params.company + 'id' + route.params.id + '/' + enclave.name )"
                                :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-300', 'cursor-pointer group flex items-center px-4 py-2 text-sm']">
                                <TvIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                View
                              </a>
                              </MenuItem>
                            </div> -->

                        <MenuItem v-slot="{ active }">
                          <a
                            :class="[
                              active ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-300',
                              'group flex items-center px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                            ]"
                            @click.stop="[(openMembers = true), (BoundaryId = enclave.id), (nameProp = enclave.name)]"
                          >
                            <UsersIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Manage Members
                          </a>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <a
                            :class="[
                              active ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-300',
                              'group flex items-center px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                            ]"
                            @click.stop="
                              [
                                (edit = true),
                                (open = true),
                                (newName = enclave.name),
                                (editId = enclave.id),
                                editUpdate(enclave.ownerId, enclave.StigLibraryId),
                              ]
                            "
                          >
                            <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Edit
                          </a>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <a
                            :class="[
                              active ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-300',
                              'group flex items-center px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                            ]"
                            @click.stop="[(openAlert = true), (errorName = enclave.name), (deleteId = enclave.id)]"
                          >
                            <TrashIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Delete
                          </a>
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
                                      Are you sure you want to delete this Enclave? This action cannot be undone.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                  type="button"
                                  class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                  @click="[(openAlert = false), deleteBoundary(deleteId)]"
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <!--Add Boundary-->
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
                  @submit.prevent="edit ? editBoundary(editData) : addBoundary(boundaryData)"
                >
                  <div class="h-0 flex-1 overflow-y-auto">
                    <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                      <div class="flex items-center justify-between">
                        <DialogTitle v-if="edit === true" class="text-base font-semibold leading-6 text-white"
                          >Edit Enclave
                        </DialogTitle>
                        <DialogTitle v-else class="text-base font-semibold leading-6 text-white"
                          >New Enclave</DialogTitle
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
                          Get started by filling in the information below to create your new enclave.
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
                              >Enclave name</label
                            >
                            <div class="mt-2">
                              <input
                                v-if="edit === true"
                                id="project-name"
                                v-model="newName"
                                required
                                type="text"
                                name="project-name"
                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                              <input
                                v-else
                                id="project-name"
                                v-model="info"
                                required
                                type="text"
                                name="project-name"
                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <Listbox v-if="edit != true" v-model="selectedOwner" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                              >Owner
                            </ListboxLabel>
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate"
                                    >{{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</span
                                  >
                                  <span class="ml-2 truncate text-gray-500">{{ selectedOwner.email }}</span>
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
                                    v-for="person in filteredUsers"
                                    :key="person.email"
                                    v-slot="{ active, selected }"
                                    as="template"
                                    :value="person"
                                  >
                                    <li
                                      :class="[
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                      ]"
                                    >
                                      <div class="flex">
                                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']"
                                          >{{ person.firstName }} {{ person.lastName }}</span
                                        >
                                        <span
                                          :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate']"
                                          >{{ person.email }}</span
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
                          </Listbox>
                          <!-- Edit View -->
                          <Listbox v-else v-model="newOwner" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                              >Owner
                            </ListboxLabel>
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate">{{ newOwner.firstName }} {{ newOwner.lastName }}</span>
                                  <span class="ml-2 truncate text-gray-500">{{ newOwner.email }}</span>
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
                                    v-for="person in filteredUsers"
                                    :key="person.email"
                                    v-slot="{ active, selected }"
                                    as="template"
                                    :value="person"
                                  >
                                    <li
                                      :class="[
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                      ]"
                                    >
                                      <div class="flex">
                                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']"
                                          >{{ person.firstName }} {{ person.lastName }}</span
                                        >
                                        <span
                                          :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate']"
                                          >{{ person.email }}</span
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
                          </Listbox>

                          <!-- <fieldset>
                            <legend class="text-sm font-medium leading-6 text-white">Owner</legend>
                            <div class="mt-2 space-y-4">
                              <div class="relative flex items-start">
                                <div class="absolute flex h-6 items-center">
                                  <input v-if="edit != true" v-model="owner" value=1 id="privacy-public" name="privacy"
                                    aria-describedby="privacy-public-description" type="radio" 
                                    class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                  Edit View
                                  <input v-else v-model="newOwner" value=1 id="privacy-public" name="privacy"
                                    aria-describedby="privacy-public-description" type="radio" 
                                    class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div class="pl-7 text-sm leading-6">
                                  <label for="privacy-public" class="font-medium text-gray-200">Admin</label>
                                  <p id="privacy-public-description" class="text-gray-400">Everyone with the link will see
                                    this project.</p>
                                </div>
                              </div>
                              <div>
                                <div class="relative flex items-start">
                                  <div class="absolute flex h-6 items-center">
                                    <input v-if="edit != true" v-model="owner" value=2 id="privacy-private-to-project"
                                      name="privacy" aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    Edit View
                                    <input v-else v-model="newOwner" value=2 id="privacy-private-to-project"
                                      name="privacy" aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                  </div>
                                  <div class="pl-7 text-sm leading-6">
                                    <label for="privacy-private-to-project"
                                      class="font-medium text-gray-200">User 1</label>
                                    <p id="privacy-private-to-project-description" class="text-gray-400">Only members of
                                      this project would be able to access.</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div class="relative flex items-start">
                                  <div class="absolute flex h-6 items-center">
                                    <input v-if="edit != true" v-model="owner" value=3 id="privacy-private" name="privacy"
                                      aria-describedby="privacy-private-to-project-description" type="radio"
                                      class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    Edit View
                                    <input v-else v-model="newOwner" value=3 id="privacy-private" name="privacy"
                                      aria-describedby="privacy-private-to-project-description" type="radio"
                                      class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                  </div>
                                  <div class="pl-7 text-sm leading-6">
                                    <label for="privacy-private" class="font-medium text-gray-200">User 2</label>
                                    <p id="privacy-private-description" class="text-gray-400">You are the only one able to
                                      access this project.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset> -->
                        </div>
                        <div class="py-4">
                          <Listbox v-if="edit != true" v-model="base" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                              >STIG Baseline
                            </ListboxLabel>
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ base.filename }}</span>
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="file in sortedStigLibrary"
                                    :key="file.id"
                                    v-slot="{ active, selected }"
                                    as="template"
                                    :value="file"
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
                                          >{{ file.filename }}</span
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
                          </Listbox>
                          <!-- Edit View -->
                          <Listbox v-else v-model="editBase" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"
                              >STIG Baseline
                            </ListboxLabel>
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ editBase.filename }}</span>
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="file in sortedStigLibrary"
                                    :key="file.id"
                                    v-slot="{ active, selected }"
                                    as="template"
                                    :value="file"
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
                                          >{{ file.filename }}</span
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
                          </Listbox>

                          <!-- RMF Versions  box -->
                          <br />
                          <Listbox v-if="edit != true" v-model="currentV" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >RMF Versions</ListboxLabel
                            >
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ currentV.title }}</span>
                                  <!-- <span class="text-xs truncate"> Classified </span> -->
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="item in rmfLibrary"
                                    :key="item.title"
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
                                          >{{ item.title }}</span
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
                          </Listbox>
                          <!-- for it to show if edit is true -->
                          <Listbox v-else v-model="currentV" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >RMF Versions</ListboxLabel
                            >
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ currentV.title }}</span>
                                  <!-- <span class="text-xs truncate"> Classified </span> -->
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="item in rmfLibrary"
                                    :key="item.version"
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
                                          >{{ item.title }}</span
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
                          </Listbox>

                          <!-- new classification box -->
                          <br />
                          <hr class="divide-y divide-gray-200 px-4 sm:px-6" />
                          <br />
                          <Listbox v-if="edit != true" v-model="foundation" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >Classification</ListboxLabel
                            >
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ foundation.name }}</span>
                                  <!-- <span class="text-xs truncate"> Classified </span> -->
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="item in classLibrary"
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
                          </Listbox>
                          <!-- show if classfification needs to be dit -->
                          <Listbox v-else v-model="foundation" as="div">
                            <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >Classification</ListboxLabel
                            >
                            <div class="relative mt-2">
                              <ListboxButton
                                class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              >
                                <span class="inline-flex w-full truncate">
                                  <span class="truncate text-xs">{{ foundation.classification }}</span>
                                  <!-- <span class="text-xs truncate"> Classified </span> -->
                                  <!-- <span class="ml-2 truncate text-gray-500">{{ base.date }}</span> -->
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
                                    v-for="item in classLibrary"
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
                                          >{{ item.classification }}</span
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
                          </Listbox>
                          <!-- Caveat Free Textfield -->
                          <br />
                          <div>
                            <label
                              for="project-name"
                              class="block text-sm font-medium leading-6 text-black dark:text-white"
                              >Caveat</label
                            >
                            <div class="mt-2">
                              <input
                                v-if="edit === true"
                                id="project-name"
                                v-model="newCaveat"
                                type="text"
                                caveatField="project-name"
                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                              <input
                                v-else
                                id="project-name"
                                v-model="cav"
                                type="text"
                                caveatField="project-name"
                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                          <!-- Edit View -->

                          <!-- <RadioGroup v-if="edit != true" v-model="base" class="mt-2">
                            <RadioGroupLabel class="sr-only">Choose a memory option</RadioGroupLabel>
                            <div class="grid grid-cols-2 gap-3 ">
                              <RadioGroupOption as="template" v-for="option in baselineOptions" :key="option.name" :value="option.value"  v-slot="{ active, checked }">
                                <div :class="['cursor-pointer focus:outline-none' , active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', checked ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold uppercase sm:flex-1']">
                                  <RadioGroupLabel as="span">{{ option.name }}</RadioGroupLabel>
                                </div>
                              </RadioGroupOption>
                            </div>
                          </RadioGroup>
                          Edit View
                          <RadioGroup v-else v-model="editBase" class="mt-2">
                            <RadioGroupLabel class="sr-only">Choose a memory option</RadioGroupLabel>
                            <div class="grid grid-cols-2 gap-3 ">
                              <RadioGroupOption as="template" v-for="option in baselineOptions" :key="option.name" :value="option.value"  v-slot="{ active, checked }">
                                <div :class="['cursor-pointer focus:outline-none' , active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', checked ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold uppercase sm:flex-1']">
                                  <RadioGroupLabel as="span">{{ option.name }}</RadioGroupLabel>
                                </div>
                              </RadioGroupOption>
                            </div>
                          </RadioGroup> -->
                        </div>
                        <!-- <div class="pb-6 pt-4">
                          <div class="mt-4 flex text-sm">
                            <a href="#" class="group inline-flex items-center text-gray-500 hover:text-gray-900">
                              <QuestionMarkCircleIcon
                                class="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span class="ml-2">Learn more about sharing</span>
                            </a>
                          </div>
                        </div> -->
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
                      v-if="edit != true"
                      type="submit"
                      class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      @click="updateDetails()"
                    >
                      Save
                    </button>
                    <button
                      v-else
                      type="submit"
                      class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      @click="[updateEditDetails(), (open = false)]"
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
  <Members
    v-if="openMembers"
    :open-members="openMembers"
    :entity-id="BoundaryId"
    entity-type="Boundary"
    common-name="Boundary"
    :name-prop="nameProp"
    @open-close="openMembers = false"
  />
  <ErrorNotification
    v-if="showErrorNotification"
    :show="showErrorNotification"
    :msg="errorMsg"
    @show="showErrorNotification = false"
  />
</template>

<script setup>
//   Add Stuff
import { ref } from "vue";
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
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import {
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  HomeIcon,
  ChevronRightIcon,
  CheckIcon,
  ChevronUpDownIcon,
  UsersIcon,
} from "@heroicons/vue/20/solid";

// Pinia Store
import { storeToRefs } from "pinia";
import { useBreadcrumbStore } from "~~/stores/Breadcrumb";

const refreshAll = async () => {
  await refreshNuxtData();
};
const showErrorNotification = ref(false);
const errorMsg = ref();
const openAlert = ref(false);
const errorName = ref("");
const deleteId = ref();
// DB Function
const info = ref("");
const owner = ref(1);
const edit = ref(false);
const newName = ref("");
const editId = ref("");
const newCaveat = ref("");
const cav = ref("");

const route = useRoute();
const baselineOptions = [
  { name: "Q1 2023", value: 0 },
  { name: "Q2 2023", value: 1 },
  { name: "Q3 2023", value: 2 },
  { name: "Q4 2023", value: 3 },
];
/// //Stig Library baseline
const { data: stigLibrary } = await useFetch("/api/stigLibrary", { key: "stigLibrary" });
/// classification API
const { data: classLibrary } = await useFetch("/api/boundaries/listClassification");
// RMF Version API
const { data: rmfLibrary } = await useFetch("/api/boundaries/listRMFVersions");
// refreshNuxtData('stigLibrary')
const sortedStigLibrary = ref({});
if (stigLibrary.value === null) {
  refreshNuxtData();
  location.reload();
} else {
  sortedStigLibrary.value = stigLibrary.value.sort((a, b) => {
    const nameA = a.libraryDate.toUpperCase(); // ignore upper and lowercase
    const nameB = b.libraryDate.toUpperCase(); // ignore upper and lowercase
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
}

const base = ref(sortedStigLibrary.value[0]);
const foundation = ref(classLibrary.value);
const currentV = ref(rmfLibrary.value);

/// ///User Selection
const { data: users } = await useFetch("/api/users");
const filteredUsers = users.value.filter((o) => o.UserRoleId === 2);
const { data: currentUser } = await useFetch("/api/auth/currentUser");
const selectedOwner = ref(currentUser.value);
const boundaryData = ref();
const editData = ref();

const newOwner = ref(filteredUsers[0]);
const editBase = ref(sortedStigLibrary.value[0]);

boundaryData.value = {
  name: info,
  ownerId: selectedOwner.value.id,
  StigLibraryId: base.value.id,
  TierId: route.params.id,
  ClassificationId: foundation.value.id,
  caveats: newCaveat,
  title: currentV.value.title,
};
// editData = {
//   "id": editId,
//   "name": newName,
//   "ownerId": newOwner.value.id,
//   "StigLibraryId": editBase.value.id,
// }
// console.log(editData)
function updateDetails() {
  boundaryData.value = {
    name: info,
    ownerId: selectedOwner.value.id,
    StigLibraryId: base.value.id,
    TierId: route.params.id,
    ClassificationId: foundation.value.id,
    caveats: cav,
    title: currentV.value.title,
  };
}

function editUpdate(user, base) {
  newOwner.value = filteredUsers[filteredUsers.findIndex((o) => o.id === user)];
  editBase.value = sortedStigLibrary.value[sortedStigLibrary.value.findIndex((o) => o.id === base)];
}
function updateEditDetails() {
  editData.value = {
    id: editId,
    name: newName,
    ownerId: newOwner.value.id,
    StigLibraryId: editBase.value.id,
    classification: foundation.value.id,
    caveatField: newCaveat,
    title: currentV.value.title,
  };
}
/// ////////////////////////////////////////////////////////////////////////////////////////////////
async function addBoundary(boundaryData) {
  try {
    await useFetch("/api/boundaries/create", {
      method: "POST",
      body: boundaryData,
    });
  } finally {
    location.reload();
  }
}
async function editBoundary(editData) {
  try {
    const { error } = await useFetch("/api/boundaries/edit", {
      method: "PUT",
      body: editData,
      watch: false,
    });
    if (error.value != null) {
      errorMsg.value = error.value.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  } finally {
    refreshNuxtData("boundaryListAPI");
  }
}
async function deleteBoundary(boundaryId) {
  try {
    const { error } = await useFetch("/api/boundaries/delete", {
      method: "POST",
      body: { id: boundaryId },
    });
    if (error.value != null) {
      errorMsg.value = error.value.statusMessage;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    } else {
      console.log("Good");
    }
  } finally {
    refreshNuxtData("boundaryListAPI");
  }
}

const boundaryList = {
  TierId: route.params.id,
};

const { data } = await useFetch("/api/boundaries/list", {
  method: "POST",
  body: boundaryList,
  key: "boundaryListAPI",
});

async function checkPermissions(enclaveId, enclaveName) {
  const { error } = await useFetch("/api/boundaries/summary", {
    method: "GET",
    query: { BoundaryId: enclaveId },
  });
  if (error.value === null) {
    router.push("/boundaries/" + route.params.company + "id" + route.params.id + "/" + enclaveName);
  } else {
    console.log("Enclave Check Failed");
    errorMsg.value = error.value.statusMessage;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

const router = useRouter();
const store = useBreadcrumbStore();
const { pages } = storeToRefs(store);
const { tierId } = storeToRefs(store);
const { deleteEnclave } = store;
// const num = store.CompanyInfo.findIndex(o => o.companyName === route.params.company)

function addItem(num, enclaveName, ownerName, dateCreated) {
  if (enclaveName.length === 0 || ownerName.length === 0 || dateCreated.length === 0) {
    return;
  }
  // invokes function in the store:
  store.addEnclaveInfo(num, enclaveName, ownerName, dateCreated);
}

const open = ref(false);
/// BreadCrumb
// const pages = ref([
// ])

function pagePosition(tierId) {
  const position = pages.value.findIndex((o) => o.tierId === tierId);
  return position;
}
const companyDetails = {
  id: route.params.id,
};
const { data: get } = await useFetch("/api/tiers/get", {
  method: "POST",
  body: companyDetails,
});
/// //////////////// Manage Members
const BoundaryId = ref(0);
const openMembers = ref(false);
</script>
