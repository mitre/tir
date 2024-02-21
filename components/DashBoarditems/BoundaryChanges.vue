<template>
  <ul role="list" class="divide-y divide-gray-500">
    <li v-for="project in projects" :key="project.id" class="flex items-center justify-between gap-x-6 py-5">
      <div class="min-w-0">
        <div class="flex items-start gap-x-3">
          <p class="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">{{ project.name }}</p>
          <p
            :class="[statuses[project.status], 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
            {{ project.status }}</p>
        </div>
        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
          <p class="whitespace-nowrap">
            On <time :datetime="project.dueDateTime">{{ project.dueDate }}</time>
          </p>
        </div>
      </div>
      <div class="flex flex-none items-center gap-x-4">
        <a :href="project.href"
          class="hidden rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-500 dark:ring-gray-300 hover:bg-gray-50 sm:block">View
          Enclave<span class="sr-only">, {{ project.name }}</span></a>
        <Menu as="div" class="relative flex-none">
          <MenuButton class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
            <span class="sr-only">Open options</span>
            <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
          </MenuButton>
          <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <MenuItems
              class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <MenuItem v-slot="{ active }">
              <a href="#"
                :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Edit<span
                  class="sr-only">, {{ project.name }}</span></a>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <a href="#"
                :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Move<span
                  class="sr-only">, {{ project.name }}</span></a>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <a href="#"
                :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Delete<span
                  class="sr-only">, {{ project.name }}</span></a>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </li>
  </ul>
</template>
  
<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/20/solid'

const statuses = {
  Added: 'text-green-700 bg-green-50 ring-green-600/20',
  Removed: 'text-red-600 bg-red-50 ring-red-500/10',
  Edited: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
}
const projects = [
  {
    id: 1,
    name: 'Boundary 1',
    href: '#',
    status: 'Added',
    createdBy: 'Leslie Alexander',
    dueDate: 'March 17, 2023',
    dueDateTime: '2023-03-17T00:00Z',
  },
  {
    id: 2,
    name: 'Boundary 2',
    href: '#',
    status: 'Removed',
    createdBy: 'Leslie Alexander',
    dueDate: 'May 5, 2023',
    dueDateTime: '2023-05-05T00:00Z',
  },
  {
    id: 3,
    name: 'Boundary 3',
    href: '#',
    status: 'Edited',
    createdBy: 'Courtney Henry',
    dueDate: 'June 10, 2023',
    dueDateTime: '2023-06-10T00:00Z',
  },
]
</script>