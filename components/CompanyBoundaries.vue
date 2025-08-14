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
            {{ companyTerm }}
          </h4>
          <h4 class="mt-1 text-lg text-gray-800 dark:text-white">
            Select your {{ companyTerm.toLowerCase() }} to view relevant {{ inflection.pluralize(boundaryTerm) }}.
          </h4>
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
                @click="[(pages.length = 0), (tierId = null), updateList(tierId)]"
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
                @click="
                  [
                    (pages.length = pagePosition(page.tierId) + 1),
                    (tierId = page.tierId),
                    checkTier(page.tierId, page.name, page.parentId),
                  ]
                "
                >{{ page.name }}</a
              >
            </div>
          </li>
        </ol>
      </nav>
      <div class="flex justify-between">
        <div class="flex items-center py-2 text-sm font-semibold text-gray-700 dark:text-white">
          <div class="flex items-center pl-0">
            <Square3Stack3DIcon class="mr-1 h-6 w-6 text-indigo-500" />
            {{ companyTerm }}
          </div>
          <div class="flex items-center pl-4">
            <ServerStackIcon class="mr-1 h-6 w-6 text-green-500" />
            {{ boundaryTerm }}
          </div>
        </div>
        <div v-show="currentUser.UserRole.name === 'User'" class="py-2">
          <button
            type="button"
            class="inline-flex items-center gap-x-1.5 rounded-md border border-indigo-500 px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white"
            @click="[(addCompany = true), (edit = false), (companyName = null)]"
          >
            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md" aria-hidden="true" />
            {{ companyTerm }}
          </button>
          <button
            type="button"
            class="ml-3 inline-flex items-center gap-x-1.5 rounded-md border border-green-500 px-3 py-1.5 text-sm font-semibold text-green-600 shadow-sm hover:bg-green-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white"
            @click="[(addBoundary = true), (edit = false)]"
          >
            <PlusIcon class="-ml-0.5 h-5 w-5 rounded-md" aria-hidden="true" />
            {{ boundaryTerm }}
          </button>
        </div>
      </div>

      <div class="rounded-lg border border-gray-400/20">
        <div class="flow-root">
          <div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-gray-400/20 dark:divide-gray-200/10">
                <thead>
                  <tr class="hover:bg-gray-300 dark:hover:bg-gray-900/50">
                    <th
                      scope="col"
                      class="w-16 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <a class="group inline-flex cursor-pointer" @click="sortTable('Type')">
                        Type
                        <span
                          class="invisible flex-none rounded text-gray-400 group-hover:visible group-focus:visible dark:text-white"
                        >
                          <ChevronUpDownIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </a>
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      <a class="group inline-flex cursor-pointer" @click="sortTable('Name')">
                        Name
                        <span
                          class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible dark:text-white"
                        >
                          <ChevronUpDownIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </a>
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      <a class="group inline-flex cursor-pointer" @click="sortTable('Owner')">
                        Owner
                        <span
                          class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible dark:text-white"
                        >
                          <ChevronUpDownIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </a>
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      <a class="group inline-flex cursor-pointer" @click="sortTable('Created')">
                        Created
                        <span
                          class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        >
                          <ChevronUpDownIcon
                            class="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible dark:text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </a>
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      <a class="group inline-flex cursor-pointer" @click="sortTable('Update')">
                        Last Update
                        <span
                          class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        >
                          <ChevronUpDownIcon
                            class="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible dark:text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </a>
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-0">
                      <span class="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-400/20 dark:divide-gray-200/10">
                  <tr
                    v-for="item in tierList"
                    :key="item.email"
                    class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900/50 sm:rounded-lg"
                    @click="
                      [item.type === 'Company' ? checkTier(item.id, item.name, item.parentId) : viewBoundary(item)]
                    "
                  >
                    <td
                      v-if="item.type === 'Company'"
                      class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      <Square3Stack3DIcon class="h-6 w-6 text-indigo-500" />
                    </td>
                    <td
                      v-if="item.type === 'Boundary'"
                      class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      <ServerStackIcon class="h-6 w-6 text-green-500" />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.name }}
                    </td>
                    <td
                      v-if="item.type === 'Company'"
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white"
                    >
                      {{ item.Tier_Users.find((o) => o.TierRoleId === 1).User.email }}
                    </td>
                    <td
                      v-if="item.type === 'Boundary'"
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white"
                    >
                      {{ item.Boundary_Users.find((o) => o.BoundaryRoleId === 1).User.email }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                      {{ formatDate(item.creationDate) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                      {{ formatDate(item.lastUpdate) }}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                      <Menu as="div" class="relative ml-auto">
                        <MenuButton
                          class="-m-2.5 block p-2.5 text-gray-800 hover:text-gray-500 hover:text-gray-500 dark:text-gray-100"
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
                            class="absolute right-0 z-10 mt-0.5 w-32 origin-top-right divide-y divide-black/20 rounded-md border border-gray-400/50 bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:divide-white/20 dark:border-white/50 dark:bg-gray-600"
                          >
                            <MenuItem v-slot="{ active }">
                              <a
                                href="#"
                                :class="[
                                  active ? 'bg-gray-200 dark:bg-gray-700' : '',
                                  'block rounded-t-md px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                                ]"
                                @click.stop="
                                  item.type === 'Boundary'
                                    ? editBoundaryMenu(item)
                                    : editCompanyMenu(item.name, item.id),
                                    (edit = true)
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
                                @click.stop="
                                  [
                                    (openMembers = true),
                                    (TierId = item.id),
                                    (nameProp = item.name),
                                    item.type === 'Boundary'
                                      ? ((entityType = 'Boundary'), (commonName = 'Boundary'))
                                      : ((entityType = 'Tier'), (commonName = 'Company')),
                                  ]
                                "
                                >Manage Members<span class="sr-only">, </span></a
                              >
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                              <a
                                href="#"
                                :class="[
                                  active ? 'bg-gray-200 dark:bg-gray-700' : '',
                                  'block rounded-b-md px-3 py-1 text-sm leading-6 text-gray-500 dark:text-gray-100',
                                ]"
                                @click.stop="
                                  [
                                    (openAlert = true),
                                    (errorName = item.name),
                                    (deleteId = item.id),
                                    (deleteType = item.type),
                                  ]
                                "
                                >Delete<span class="sr-only">, </span></a
                              >
                            </MenuItem>
                          </MenuItems>
                        </transition>
                      </Menu>
                      <!-- Delete Company Alert-->
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
                                          Are you sure you want to delete this
                                          {{ deleteType === "Boundary" ? boundaryTerm : companyTerm }}? All of your data
                                          will be removed from our servers. This action cannot be undone.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                      type="button"
                                      class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                      @click="
                                        [
                                          (openAlert = false),
                                          deleteType === 'Boundary'
                                            ? removeBoundary(deleteId)
                                            : removeCompany(deleteId),
                                        ]
                                      "
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
      <!-- Add/Edit Company Slide-over-->
      <TransitionRoot as="template" :show="addCompany">
        <Dialog as="div" class="relative z-10" @close="addCompany = false">
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
                      @submit.prevent="edit ? updateEditDetails() : createCompany()"
                    >
                      <div class="h-0 flex-1 overflow-y-auto">
                        <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                          <div class="flex items-center justify-between">
                            <DialogTitle v-if="edit" class="text-base font-semibold leading-6 text-white">
                              Edit {{ companyTerm }}</DialogTitle
                            >
                            <DialogTitle v-else class="text-base font-semibold leading-6 text-white">
                              Add {{ companyTerm }}</DialogTitle
                            >
                            <div class="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                class="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                @click="addCompany = false"
                              >
                                <span class="absolute -inset-2.5" />
                                <span class="sr-only">Close panel</span>
                                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div class="mt-1">
                            <p v-if="edit" class="text-sm text-indigo-300">
                              Edit your {{ companyTerm }} and save changes.
                            </p>
                            <p v-else class="text-sm text-indigo-300">Enter a name for your {{ companyTerm }}</p>
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
                                  {{ companyTerm }} Name
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
                          @click="addCompany = false"
                        >
                          Cancel
                        </button>
                        <button
                          v-if="edit"
                          type="submit"
                          class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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

      <!--Add/Edit Boundary-->
      <TransitionRoot as="template" :show="addBoundary">
        <Dialog as="div" class="relative z-10" @close="addBoundary = false">
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
                      @submit.prevent="edit ? confirmSelection() : createBoundary(boundaryData)"
                    >
                      <div class="h-0 flex-1 overflow-y-auto">
                        <div class="bg-indigo-700 px-4 py-6 sm:px-6">
                          <div class="flex items-center justify-between">
                            <DialogTitle v-if="edit === true" class="text-base font-semibold leading-6 text-white">
                              Edit {{ boundaryTerm }}
                            </DialogTitle>
                            <DialogTitle v-else class="text-base font-semibold leading-6 text-white"
                              >New {{ boundaryTerm }}
                            </DialogTitle>
                            <div class="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                class="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                @click="addBoundary = false"
                              >
                                <span class="absolute -inset-2.5" />
                                <span class="sr-only">Close panel</span>
                                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div class="mt-1">
                            <p v-if="edit" class="text-sm text-indigo-300">
                              Edit and save changes to your {{ boundaryTerm }} below.
                            </p>
                            <p v-else class="text-sm text-indigo-300">
                              Get started by filling in the information below to create your new
                              {{ boundaryTerm.toLowerCase() }}.
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
                                  >{{ boundaryTerm }} name</label
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
                              <Listbox v-if="edit != true" v-model="policyDoc" as="div">
                                <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                                  >RMF Versions</ListboxLabel
                                >
                                <div class="relative mt-2">
                                  <ListboxButton
                                    class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  >
                                    <span class="inline-flex w-full truncate">
                                      <span class="truncate text-xs">{{ policyDoc.title }}</span>
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
                              <Listbox v-else v-model="editPolicyDoc" as="div">
                                <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                                  >RMF Versions</ListboxLabel
                                >
                                <div class="relative mt-2">
                                  <ListboxButton
                                    class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  >
                                    <span class="inline-flex w-full truncate">
                                      <span class="truncate text-xs">{{ editPolicyDoc.title }}</span>
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
                              <Listbox v-if="edit != true" v-model="classification" as="div">
                                <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                                  >Classification</ListboxLabel
                                >
                                <div class="relative mt-2">
                                  <ListboxButton
                                    class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  >
                                    <span class="inline-flex w-full truncate">
                                      <span class="truncate text-xs">{{ classification.name }}</span>
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
                              <Listbox v-else v-model="editClassification" as="div">
                                <ListboxLabel class="block text-sm font-medium leading-6 text-black dark:text-white"
                                  >Classification</ListboxLabel
                                >
                                <div class="relative mt-2">
                                  <ListboxButton
                                    class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  >
                                    <span class="inline-flex w-full truncate">
                                      <span class="truncate text-xs">{{ editClassification.name }}</span>
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
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          @click="addBoundary = false"
                        >
                          Cancel
                        </button>
                        <button
                          v-if="edit != true"
                          type="submit"
                          class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          @click="[updateDetails(), (addBoundary = false)]"
                        >
                          Save
                        </button>
                        <button
                          v-else
                          type="submit"
                          class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          @click="[updateBoundaryEditDetails()]"
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
          <TransitionRoot as="template" :show="openConfirmation">
            <Dialog as="div" class="relative z-10" @close="openConfirmation = false">
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
                      class="relative transform overflow-hidden rounded-lg bg-gray-100 text-left shadow-xl transition-all dark:bg-gray-900"
                    >
                      <div>
                        <div class="px-8 py-6 text-center">
                          <DialogTitle as="h3" class="text-lg font-bold leading-6 text-black dark:text-white"
                            >Confirm STIG Baseline Changes
                          </DialogTitle>
                          <div class="mt-4 rounded-lg bg-gray-100/5 p-4">
                            <p class="text-md flex justify-center font-semibold text-gray-600 dark:text-white">
                              {{ originalStigLibrary.filename }}
                              <ArrowLongRightIcon class="mx-4 h-7 w-7 text-gray-600 dark:text-white" />
                              {{ editBase.filename }}
                            </p>
                          </div>
                        </div>
                      </div>
                      <!-- Confirm/Cancel Buttons -->
                      <div class="flex w-full justify-center gap-4 bg-gray-100/5 py-4">
                        <button
                          type="button"
                          class="inline-flex w-24 justify-center rounded-md border border-white/50 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          @click="[userConfirm(), (openConfirmation = false)]"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          class="inline-flex w-24 justify-center rounded-md border border-white/50 bg-red-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          @click="openConfirmation = false"
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
                            >Changing STIG Library
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
        </Dialog>
      </TransitionRoot>
    </div>
  </div>

  <Members
    v-if="openMembers"
    :open-members="openMembers"
    :entity-id="TierId"
    :entity-type="entityType"
    :common-name="commonName"
    :name-prop="nameProp"
    @open-close="openMembers = false"
  />
  <ErrorNotification
    v-if="showErrorNotification"
    :show="showErrorNotification"
    :error="errorObject"
    @show="showErrorNotification = false"
  />
</template>

<script setup>
import {
  PlusIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
  HomeIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/vue/20/solid";
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
  ArrowLongRightIcon,
  ServerStackIcon,
  Square3Stack3DIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import inflection from "inflection";
import { useBreadcrumbStore } from "~~/stores/Breadcrumb";
import { useAliasStore } from "~/stores/AliasStorage";
const aliasStore = useAliasStore();

const showErrorNotification = ref(false);
const errorObject = ref();
const errorName = ref("");
const addCompany = ref(false);
const addBoundary = ref(false);
const openAlert = ref(false);
const companyName = ref();
const editCompanyName = ref(companyName);
const deleteId = ref();
const deleteType = ref();
const edit = ref(false);
const openMembers = ref(false);
const TierId = ref(0);
const nameProp = ref("");
const entityType = ref("");
const commonName = ref("");
const editId = ref();
const store = useBreadcrumbStore();
const { pages } = storeToRefs(store);
const { tierId } = storeToRefs(store);
pages.value.length = pagePosition(tierId.value) + 1;
const companyDetails = {
  id: tierId,
};

const boundaryTerm = aliasStore.BoundaryAlias;
const companyTerm = aliasStore.CompanyAlias;

const { data: currentUser } = await useFetch("/api/auth/currentUser");
const { data: companyList } = await useFetch("/api/tiers/list", {
  method: "POST",
  body: {
    parentId: tierId.value,
  },
  key: "tierListAPI",
});
const { data: boundaryList } = await useFetch("/api/boundaries/list", {
  method: "POST",
  body: {
    TierId: tierId,
  },
  key: "boundaryListAPI",
});
const tierList = ref([]);
for (let i = 0; i < companyList.value.length; i++) {
  companyList.value[i].type = "Company";
  tierList.value.push(companyList.value[i]);
}
for (let i = 0; i < boundaryList.value.length; i++) {
  boundaryList.value[i].type = "Boundary";
  tierList.value.push(boundaryList.value[i]);
}

const { data: get } = await useFetch("/api/tiers/get", {
  method: "POST",
  body: companyDetails,
});
const { data: users } = await useFetch("/api/users");
const filteredUsers = users.value.filter((o) => o.UserRoleId === 2);

function addBreadcrumb(pageInfo) {
  store.addBreadcrumb(pageInfo);
}

function deleteBreadcrumb(parentId) {
  store.deleteBreadcrumb(parentId);
}

async function checkTier(id, companyName, parentId) {
  try {
    const nextCompany = await $fetch("/api/tiers/list", {
      method: "POST",
      body: { parentId: id },
    });

    await $fetch("/api/tiers/get", {
      method: "POST",
      body: { id },
    });

    const nextBoundary = await $fetch("/api/boundaries/list", {
      method: "POST",
      body: { TierId: id },
    });
    tierList.value.length = 0;
    for (let i = 0; i < nextCompany.length; i++) {
      nextCompany[i].type = "Company";
      tierList.value.push(nextCompany[i]);
    }
    for (let i = 0; i < nextBoundary.length; i++) {
      nextBoundary[i].type = "Boundary";
      tierList.value.push(nextBoundary[i]);
    }
    uniqueCompany(id, companyName, parentId);

    tierId.value = id;
  } catch (error) {
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function viewBoundary(boundary) {
  try {
    await $fetch("/api/boundaries/summary", {
      method: "GET",
      query: { BoundaryId: boundary.id, authOnly: true },
    });

    await navigateTo({
      path: "/company-boundary/" + boundary.id,
    });
  } catch (error) {
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function updateList(id) {
  const nextCompany = await $fetch("/api/tiers/list", {
    method: "POST",
    body: { parentId: id },
  });

  const nextBoundary = await $fetch("/api/boundaries/list", {
    method: "POST",
    body: { TierId: id },
  });
  tierList.value.length = 0;
  for (let i = 0; i < nextCompany.length; i++) {
    nextCompany[i].type = "Company";
    tierList.value.push(nextCompany[i]);
  }
  for (let i = 0; i < nextBoundary.length; i++) {
    nextBoundary[i].type = "Boundary";
    tierList.value.push(nextBoundary[i]);
  }
}

async function createCompany() {
  try {
    await $fetch("/api/tiers/create", {
      method: "POST",
      body: {
        name: companyName.value,
        parentId: tierId.value,
      },
    });
    updateList(tierId.value);
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    addCompany.value = false;
  }
}

function editCompanyMenu(name, id) {
  editCompanyName.value = name;
  editId.value = id;
  addCompany.value = true;
}

async function updateEditDetails() {
  const editCompanyPkg = {
    id: editId.value,
    name: editCompanyName.value,
  };
  addCompany.value = false;
  try {
    await $fetch("/api/tiers/edit", {
      method: "PUT",
      body: editCompanyPkg,
      watch: false,
    });
  } catch (error) {
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    updateList(tierId.value);
  }
}

async function removeCompany(companyId) {
  try {
    await $fetch("/api/tiers/remove", {
      method: "POST",
      body: { id: companyId },
    });
  } catch (error) {
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    updateList(tierId.value);
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
      addBreadcrumb({ name, tierId: id, parentId });
    } else {
      addBreadcrumb({ name, tierId: id, parentId });
    }
  } else {
    console.log("Not unique ID");
  }
}

function formatDate(isoDate) {
  try {
    const parsedDate = new Date(isoDate);

    const format = {
      // month: "short",
      // day: "numeric",
      // year: "numeric",
      // hour: "numeric",
      // minute: "numeric",
      // second: "numeric",
      timeZoneName: "short",
    };
    const formattedDate = parsedDate.toLocaleString("en-US", format);
    return formattedDate;
  } catch (error) {
    return "Invalid date";
  }
}
const typeCount = ref(0);

const nameA = ref();
const nameB = ref();
function sortTable(column) {
  tierList.value.sort((a, b) => {
    if (column === "Type") {
      nameA.value = a.type.toUpperCase(); // ignore upper and lowercase
      nameB.value = b.type.toUpperCase(); // ignore upper and lowercase
    } else if (column === "Name") {
      nameA.value = a.name.toUpperCase(); // ignore upper and lowercase
      nameB.value = b.name.toUpperCase(); // ignore upper and lowercase
    } else if (column === "Owner") {
      nameA.value = a.owner.email.toUpperCase(); // ignore upper and lowercase
      nameB.value = b.owner.email.toUpperCase(); // ignore upper and lowercase
    } else if (column === "Created") {
      nameA.value = a.creationDate; // ignore upper and lowercase
      nameB.value = b.creationDate; // ignore upper and lowercase
    } else if (column === "Update") {
      nameA.value = a.lastUpdate; // ignore upper and lowercase
      nameB.value = b.lastUpdate; // ignore upper and lowercase
    }
    if (nameA.value < nameB.value) {
      if (typeCount.value === 0) {
        return -1;
      } else {
        return 1;
      }
    }
    if (nameA.value > nameB.value) {
      if (typeCount.value === 0) {
        return 1;
      } else {
        return -1;
      }
    }
    // names must be equal
    return 0;
  });
  if (typeCount.value >= 1) {
    typeCount.value = 0;
  } else {
    typeCount.value++;
  }
}

const originalStigLibrary = ref("");
const loading = ref(false);
const openConfirmation = ref(false);

/// Stig Library baseline
const { data: stigLibrary } = await useFetch("/api/stigLibrary", { key: "stigLibrary" });
/// classification API
const { data: classLibrary } = await useFetch("/api/boundaries/listClassification");
// RMF Version API
const { data: rmfLibrary } = await useFetch("/api/boundaries/listRMFVersions");

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

const boundaryData = ref();
const editData = ref();
const base = ref(sortedStigLibrary.value[0]);
const editBase = ref(sortedStigLibrary.value[0]);
const policyDoc = ref(rmfLibrary.value[0]);
const editPolicyDoc = ref(rmfLibrary.value[0]);
const classification = ref(classLibrary.value[0]);
const editClassification = ref(classLibrary.value[0]);
const cav = ref("");
const newCaveat = ref("");
const info = ref("");
const newName = ref("");

boundaryData.value = {
  name: info,
  StigLibraryId: base.value.id,
  TierId: tierId,
  ClassificationId: classification.value.id,
  caveats: cav.value,
  PolicyDocumentId: policyDoc.value.id,
};

function updateDetails() {
  boundaryData.value = {
    name: info,
    StigLibraryId: base.value.id,
    TierId: tierId,
    ClassificationId: classification.value.id,
    caveats: cav.value,
    PolicyDocumentId: policyDoc.value.id,
  };
}

function editBoundaryMenu(enclave) {
  editId.value = enclave.id;
  newName.value = enclave.name;
  editBase.value = sortedStigLibrary.value[sortedStigLibrary.value.findIndex((o) => o.id === enclave.StigLibraryId)];
  editClassification.value = classLibrary.value[classLibrary.value.findIndex((o) => o.id === enclave.ClassificationId)];
  newCaveat.value = enclave.caveats;
  editPolicyDoc.value = rmfLibrary.value[rmfLibrary.value.findIndex((o) => o.id === enclave.PolicyDocumentId)];
  originalStigLibrary.value = editBase.value;
  addBoundary.value = true;
}
function updateBoundaryEditDetails() {
  editData.value = {
    id: editId,
    name: newName,
    TierId: tierId,
    StigLibraryId: editBase.value.id,
    ClassificationId: editClassification.value.id,
    caveats: newCaveat,
    PolicyDocumentId: editPolicyDoc.value.id,
  };
}
async function createBoundary(boundaryData) {
  try {
    await $fetch("/api/boundaries/create", {
      method: "POST",
      body: boundaryData,
    });
    location.reload();
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function confirmSelection() {
  if (originalStigLibrary.value.id === editData.value.StigLibraryId) {
    await editBoundary(editData.value);
  } else {
    openConfirmation.value = true;
  }
}

async function userConfirm() {
  loading.value = true;
  try {
    await $fetch("/api/boundaries/changeStigLibrary", {
      method: "POST",
      body: { BoundaryId: editId.value, StigLibraryId: editData.value.StigLibraryId },
    });
    loading.value = false;
    await editBoundary(editData.value);
  } catch (err) {
    loading.value = false;
    addBoundary.value = false;
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  }
}

async function editBoundary(editData) {
  try {
    await $fetch("/api/boundaries/edit", {
      method: "PUT",
      body: editData,
      watch: false,
    });
  } catch (err) {
    errorObject.value = err;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    updateList(tierId.value);
    addBoundary.value = false;
  }
}
async function removeBoundary(boundaryId) {
  try {
    await $fetch("/api/boundaries/delete", {
      method: "POST",
      body: { id: boundaryId },
    });
  } catch (error) {
    errorObject.value = error;
    showErrorNotification.value = true;
    setTimeout(() => (showErrorNotification.value = false), 6000);
  } finally {
    updateList(tierId.value);
  }
}
</script>
