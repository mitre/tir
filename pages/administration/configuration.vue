<template>
  <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">



        <div class="mx-auto max-w-7xl pt-4 lg:flex lg:gap-x-16 lg:px-8">
          <aside
            class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
            <nav class="flex-none px-4 sm:px-6 lg:px-0">
              <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
                <li v-for="item in secondaryNavigation" :key="item.name">
                  <a @click="router.push(item.href)"
                    :class="[item.current ? 'bg-gray-100 dark:bg-gray-50 text-indigo-600' : 'text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-50', 'group cursor-pointer flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold']">
                    <component :is="item.icon"
                      :class="[item.current ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-100 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                      aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <main class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
            <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
              <div>
                <h2 class="text-base font-semibold leading-7 text-gray-800 dark:text-white">App Configuration</h2>
                <p class="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-200">Edit parameters below:</p>

                <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div class="pt-6 sm:flex">
                    <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Terminology</dt>
                    <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div>
                        <select id="location" name="location"
                          class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                          <option>MITRE</option>
                          <option selected="">LM</option>
                          <option>General</option>
                        </select>
                      </div>
                      <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
                    </dd>
                  </div>
                  <div class="pt-6 sm:flex">
                    <dt class="font-medium text-gray-800 dark:text-white sm:w-64 sm:flex-none sm:pr-6">Other Setting</dt>
                    <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div class="text-gray-800 dark:text-white">Sample</div>
                      <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
                    </dd>
                  </div>
                </dl>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
      
<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { Bars3Icon } from '@heroicons/vue/20/solid'
import {
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
const router = useRouter()
import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();

onBeforeMount(() => {
  store.changeUsername('Administration')
})

const secondaryNavigation = [
  { name: 'General', href: '/administration/general', icon: UserCircleIcon, current: false },
  { name: 'Configuration', href: '/administration/configuration', icon: WrenchIcon, current: true },
  { name: 'Notifications', href: '#', icon: BellIcon, current: false },
  { name: 'Users', href: '/administration/team-members', icon: UsersIcon, current: false },
  { name: 'Logs', href: '/administration/logs', icon: DocumentDuplicateIcon, current: false },
]
const mobileMenuOpen = ref(false)
const automaticTimezoneEnabled = ref(true)
</script>