<template>
  <div class="min-h-full">
    <!-- <div class="bg-gray-800 pb-32"> -->
    <Disclosure as="nav" class="dark:bg-gray-800 bg-white shadow" v-slot="{ open }">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="">
          <div class="flex h-16 items-center justify-between px-4 sm:px-0">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img class="h-14 w-14" src="../assets/TIR_Icon.svg" alt="Your Company" />
              </div>
              <div class="hidden md:block">
                <div class="ml-6 flex items-baseline space-x-4">
                  <a v-for="item in navigation" :key="item.name" :href="item.href"
                    @click="[checkTab(item.name), router.push(item.href)]"
                    :class="[item.current ? 'bg-gray-200 dark:bg-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white', 'rounded-md px-3 py-2 text-sm font-medium']"
                    :aria-current="item.current ? 'page' : undefined">{{ item.name }} </a>
                  <a v-if="currentUser.UserRole.id === 1 || currentUser.UserRole.id === 99"
                    v-for="item in adminNavigation" :key="item.name" :href="item.href" @click="checkTab(item.name)"
                    :class="[item.current ? 'bg-gray-200 dark:bg-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white', 'rounded-md px-3 py-2 text-sm font-medium']"
                    :aria-current="item.current ? 'page' : undefined">{{ item.name }} </a>
                </div>

              </div>
            </div>
            <!-- This is for the about -->
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <Popover v-slot="{ open }" class="relative">
                  <PopoverButton :class="open ? 'text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
                    class="flex max-w-xs items-center rounded-full dark:bg-gray-800 text-sm hover:text-black dark:hover:text-white ">
                    <!-- <span>About</span> -->
                    <QuestionMarkCircleIcon :class="open ? 'dark:text-white-300' : 'dark:text-gray-400'"
                      class=" h-8 w-8 transition duration-150 ease-in-out group-hover:text-white" aria-hidden="true" />
                  </PopoverButton>
                  <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0">
                    <PopoverPanel class="absolute left-1/2 z-10 mt-3 w-max max-w-xs -translate-x-1/2 transform px-2">
                      <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                        <div class="relative bg-white p-4 text-sm ">
                          <p class="pb-2 border-b-2 border-indigo-400 w-max ">Date: {{ dateCleaner }}</p>

                          <p class="pt-2">Version: {{ currentAbout.version }}</p>
                        </div>
                      </div>
                    </PopoverPanel>
                  </transition>
                </Popover>

                <!-- Profile dropdown -->
                <Menu as="div" class="relative ml-7">
                  <div>
                    <MenuButton
                      class="flex max-w-xs items-center rounded-full dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span class="sr-only">Open user menu</span>
                      <UserIcon class="h-8 w-8" aria-hidden="true" />
                    </MenuButton>
                  </div>
                  <transition enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95">
                    <MenuItems
                      class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem v-for="(item, index) in userNavigation" :key="item.name" v-slot="{ active }">
                      <a v-if="index === 0" :href="item.href"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{ item.name
                        }}</a>
                      <a v-else :href="item.href"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                        @click="clearStorage()">{{ item.name
                        }}</a>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>

                <!-- Alert dropdown -->
                <Menu as="div" class="relative ml-7">
                  <div @mouseover="isMenuOpen = true" @mouseleave="isMenuOpen = false">
                    <MenuButton
                      class="flex max-w-xs items-center rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span class="sr-only">Bell Icon</span>
                      <BellIcon class="h-8 w-8" aria-hidden="true" />
                      <span v-if="unreadAlertCount > 0"
                        class="absolute bottom-0 right-0 transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {{ unreadAlertCount > 10 ? '10+' : unreadAlertCount }}</span>
                    </MenuButton>
                    <MenuItems v-if="isMenuOpen"
                      class="menu-items-container absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      style="max-height: 300px; overflow-y: auto; width: 800%; margin-top: 0px;">
                      <ul role="list" class="divide-y divide-gray-250">
                        <MenuItem v-for="alert in userBell" :key="alert.id"
                          class="flex items-center justify-between gap-x-6 py-5">
                        <div class="flex min-w-0 gap-x-4 mx-2">
                          <div />
                          <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900"> {{ alert.category }}</p>
                            <p class="mt-1 truncate text-xs leading-5 text-gray-500">{{ alert.message }}</p>
                          </div>
                          <button @click="() => resetInput(alert)"
                            class="rectangle-full bg-white p-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 hover:text-white">
                            <XMarkIcon class="h-4 w-4"></XMarkIcon>
                          </button>
                        </div>
                        </MenuItem>
                      </ul>
                      <button @click="showPopup = true"
                        class="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0">View
                        all</button>
                    </MenuItems>
                  </div>
                </Menu>


                <!-- Alert Pop up window -->
                <div v-if="showPopup" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div class="bg-gray-100 dark:bg-gray-900">
                    <div class="mx-auto max-w-7xl">
                      <div class="bg-gray-100 dark:bg-gray-900 py-10">
                        <div class="px-4 sm:px-6 lg:px-8">
                          <div class="sm:flex sm:items-center">
                            <div class="sm:flex-auto">
                              <h1 class="text-base font-semibold leading-6 text-gray-800 dark:text-white">Alert Center
                              </h1>
                              <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">A list of all the current alerts
                              </p>
                            </div>
                          </div>
                          <div class="mt-8 flow-root">
                            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                              <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table class="min-w-full divide-y divide-gray-700">
                                  <thead>
                                    <tr>
                                      <th scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                                        Date
                                      </th>
                                      <th scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                                        Alert
                                      </th>
                                      <th scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                                        Messages</th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-500">
                                    <tr v-for="alert in sortedAlerts" :key="alert.id"
                                      :class="{ 'bg-gray-300 dark:bg-gray-800': !alert.read }">
                                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">{{
                                        formartAlertDate(alert.date) }}</td>
                                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">{{
                                        alert.category }}
                                      </td>
                                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">{{
                                        alert.message }}
                                      </td>
                                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button @click="deleteTheAlert(alert.id)" class="text-red-600 hover:text-red-900">
                                          <TrashIcon class="h-5 w-5" aria-hidden="true" />
                                        </button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <button @click="showPopup = false"
                                  class="mt-4 bg-red-500 hover:bg-red-700 text-white front-bold py-2 px-4 rounded">Close</button>
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
            <div class="-mr-2 flex md:hidden">
              <!-- Mobile menu button -->
              <!-- <DisclosureButton
                class="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span class="sr-only">Open main menu</span>
                <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
                <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
              </DisclosureButton> -->
            </div>
          </div>
        </div>
      </div>



      <!-- <DisclosurePanel class="border-b border-gray-700 md:hidden">
        <div class="space-y-1 px-2 py-3 sm:px-3">
          <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href"
            :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium']"
            :aria-current="item.current ? 'page' : undefined">{{ item.name }}</DisclosureButton>
        </div>
        <div class="border-t border-gray-700 pb-3 pt-4">
          <div class="flex items-center px-5">
            <div class="flex-shrink-0">
              <UserIcon class="h-6 w-6" aria-hidden="true" />
            </div>
            <div class="ml-3">
              <div class="text-base font-medium leading-none text-white">{{ user.name }}</div>
              <div class="text-sm font-medium leading-none text-gray-400">{{ user.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1 px-2">
            <DisclosureButton v-for="item in userNavigation" :key="item.name" as="a" :href="item.href"
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">{{
                item.name }}</DisclosureButton>
          </div>
        </div>
      </DisclosurePanel> -->
    </Disclosure>
    <header class="py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">{{ store.username }}</h1>
      </div>
    </header>
    <!-- </div> -->


  </div>
</template>
  
<script setup>

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { WrenchScrewdriverIcon, Bars3Icon, XMarkIcon, UserIcon, BellIcon, TrashIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import { useTestStore } from "~~/stores/HeaderValues";
import { useBreadcrumbStore } from "~~/stores/Breadcrumb";
import { storeToRefs } from "pinia";
import { ref, computed } from 'vue';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { DateTime } from 'luxon';


const store = useTestStore();
const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const showPopup = ref(false)

const colorMode = useColorMode()


// const username = ref("");

const breadStore = useBreadcrumbStore()

// is for the Alert Bell Below 
const markAsRead = async (alertId) => {
  try {
    const response = await fetch("/api/config/alertRead", {
      method: 'PUT',
      body: JSON.stringify({ id: alertId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await response.json();
    console.log("API response:", responseData);
    if (responseData.success) {
      console.log('alert marked as read');
    } else {
      console.error('Failed to makr alert as read');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const resetInput = async (alert) => {
  event.stopPropagation();
  const alertId = alert.id;
  console.log("marking as read, alert ID:", alertId);
  // calling the API to mark as read
  await markAsRead(alertId);

  //find the alert in curentAlert.value n marking it as read
  const alertIndex = currentAlert.value.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    currentAlert.value[alertIndex].read = true;

    //trigger reactivity
    currentAlert.value = [...currentAlert.value];
  } else {
    console.error("Alert not found in currentAlert.value");
  }
};

// Logic for the delete method in the Alerts
const deleteTheAlert = async (alertId) => {
  const prevAlert = [...currentAlert.value];
  currentAlert.value = currentAlert.value.filter(alert => alert.id !== alertId);
  try {
    const response = await fetch("/api/config/alert", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: alertId }),
    });
    const responseData = await response.json();
    if (!responseData.success) {
      console.error("Alert was NOT deleted..");
      currentAlert.value = prevAlert;
    }
  } catch (error) {
    console.error("Error: ", error);
    currentAlert.value = prevAlert;
  }
};

// const currentUser = useCookie('current-user')


///////Check User Role

const { data: currentUser } = await useFetch("/api/auth/currentUser");
if (currentUser.value.Theme) {
  colorMode.preference = currentUser.value.Theme.name.toLowerCase();
}
else {
  colorMode.preference = 'system';
}


const { data: currentAlert } = await useFetch("/api/config/alert", {
  method: 'GET',
  query: { userId: currentUser.value.id },
})

// Makes the newst alert come on top in the pop up window view all
const sortedAlerts = computed(() => {
  if (!currentAlert.value) {
    return [];
  }
  return currentAlert.value
    .slice()
    .sort((a, b) => DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis());
})

// The number of alerts for the notification bell
const unreadAlertCount = computed(() => {
  return currentAlert.value.filter(alert => !alert.read).length;
});

const { data: currentAbout } = await useFetch("/api/config/about");

const dateCleaner = computed(() => {
  if (currentAbout.value && currentAbout.value.date) {
    const dateObj = new Date(currentAbout.value.date);
    return dateObj.toLocaleDateString();
  }
  return '';

})

function formartAlertDate(isoDate) {
  return DateTime.fromISO(isoDate).toLocaleString({
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}





const user = {
  name: 'Power User',
  email: 'poweruser@tir.com',
  imageUrl:
    UserIcon,
}
const navigation = [
  { name: 'Dashboard', href: '/home', current: decodeURIComponent(route.fullPath) === '/home' },
  { name: 'Boundaries', href: '/company-boundaries', current: decodeURIComponent(route.fullPath) === '/company-boundaries' },
  { name: 'Libraries', href: '/libraries', current: decodeURIComponent(route.fullPath) === '/libraries' },
  // { name: 'Administration', href: '/administration/general', current: (decodeURIComponent(route.fullPath) === '/administration/team-members') ||
  //   (decodeURIComponent(route.fullPath) ==='/administration/general')},
]
const adminNavigation = [
  {
    name: 'Administration', href: '/administration/general', current: (decodeURIComponent(route.fullPath) === '/administration/team-members') ||
      (decodeURIComponent(route.fullPath) === '/administration/general')
  },
]
const userNavigation = [
  { name: 'Your Profile', href: '/profile/' + currentUser.value.email },
  { name: 'Sign out', href: '/logout' },
]
const userBell = computed(() => {
  return currentAlert.value.filter(alert => !alert.read)
    .map(alert => ({
      ...alert,
      userId: alert.userId,
      category: `Alert: ${alert.category}`,
      message: alert.message,
      read: alert.read,
      href: '#',
      date: formartAlertDate(alert.date),
    }))
    .sort((a, b) => DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis());
});

function checkTab(name) {
  if (name === 'Boundaries') {
    breadStore.pages.length = 0
    breadStore.tierId = null
  }
}

function clearStorage() {
  localStorage.removeItem("nuxt-color-mode");
}

</script>