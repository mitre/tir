<template>
  <div class="min-h-full">
    <SiteBanner v-if="true" />
    <div v-if="isDataReady">
      <!-- Static Navigation Bar -->
      <nav class="bg-white shadow dark:bg-gray-800">
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between px-4 sm:px-0">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img class="h-14 w-14" src="../assets/TIR_Icon.svg" alt="Your Company" />
              </div>
              <div class="hidden md:block">
                <div class="ml-6 flex items-baseline space-x-4">
                  <NuxtLink
                    v-for="navItem in navigation"
                    :key="navItem.name"
                    :to="navItem.href"
                    class="rounded-md px-3 py-2 text-sm font-medium"
                    :class="
                      navItem.current
                        ? 'bg-gray-200 dark:bg-gray-900 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    "
                    :aria-current="navItem.current ? 'page' : undefined"
                    @click="checkTab(navItem.name)"
                  >
                    {{ navItem.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <!-- About Section with Popover -->
                <Popover v-slot="{ open }" class="relative">
                  <PopoverButton
                    :id="id"
                    :class="open ? 'text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
                    class="flex max-w-xs items-center rounded-full text-sm hover:text-black dark:bg-gray-800 dark:hover:text-white"
                  >
                    <QuestionMarkCircleIcon
                      :class="open ? 'dark:text-white-300' : 'dark:text-gray-400'"
                      class="h-8 w-8 transition duration-150 ease-in-out group-hover:text-white"
                      aria-hidden="true"
                    />
                  </PopoverButton>
                  <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0"
                  >
                    <PopoverPanel class="absolute left-1/2 z-10 mt-3 w-max max-w-xs -translate-x-1/2 transform px-2">
                      <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                        <div class="relative bg-white p-4 text-sm text-gray-700">
                          <p class="w-max border-b-2 border-indigo-400 pb-2">Date: {{ dateCleaner }}</p>
                          <p class="pt-2">Version: {{ currentAbout?.version || "N/A" }}</p>
                        </div>
                      </div>
                    </PopoverPanel>
                  </transition>
                </Popover>

                <!-- Profile Section with Menu -->
                <Menu as="div" class="relative ml-7">
                  <div>
                    <MenuButton
                      :id="id"
                      class="flex max-w-xs items-center rounded-full text-sm text-gray-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
                    >
                      <span class="sr-only">Open user menu</span>
                      <UserIcon class="h-8 w-8" aria-hidden="true" />
                    </MenuButton>
                  </div>
                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <MenuItem v-for="(userItem, index) in userNavigation" :key="userItem.name" v-slot="{ active }">
                        <template v-if="userItem">
                          <NuxtLink
                            v-if="userItem.href"
                            :to="userItem.href"
                            class="block px-4 py-2 text-sm text-gray-700"
                            :class="active ? 'bg-gray-100' : ''"
                          >
                            {{ userItem.name }}
                          </NuxtLink>
                          <button
                            v-else-if="userItem.onClick"
                            @click="userItem.onClick"
                            class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {{ userItem.name }}
                          </button>
                        </template>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>

                <!-- Alerts Section with Menu -->
                <Menu as="div" class="relative ml-7">
                  <div>
                    <MenuButton
                      :id="id"
                      class="flex max-w-xs items-center rounded-full text-sm text-gray-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 dark:text-gray-400 dark:hover:text-white"
                    >
                      <span class="sr-only">Bell Icon</span>
                      <BellIcon class="h-8 w-8" aria-hidden="true" />
                      <span
                        v-if="unreadAlertCount > 0"
                        class="absolute bottom-0 right-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold leading-none text-white"
                      >
                        {{ unreadAlertCount > 10 ? "10+" : unreadAlertCount }}
                      </span>
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
                        class="menu-items-container absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white pt-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <ul role="list" class="divide-gray-250 max-h-72 divide-y overflow-y-auto">
                          <MenuItem
                            v-for="alert in userBell"
                            :key="alert.id"
                            class="flex items-center justify-between gap-x-4 py-5"
                          >
                            <div class="mx-1 flex min-w-0">
                              <div />
                              <div class="min-w-0 flex-auto">
                                <p class="text-sm font-semibold leading-6 text-gray-900">
                                  {{ alert.NotificationCategory?.category || "Unknown" }}
                                </p>
                                <p class="mt-1 truncate text-xs leading-5 text-gray-500">{{ alert.message || "" }}</p>
                              </div>
                              <button @click="() => resetInput(alert)">
                                <XMarkIcon class="mr-3 h-5 w-5 text-gray-900 hover:text-red-500"></XMarkIcon>
                              </button>
                            </div>
                          </MenuItem>
                          <MenuItem v-if="userBell.length === 0" class="flex items-center justify-between gap-x-6 py-5">
                            <div class="mx-2 flex min-w-0 gap-x-4">
                              <div />
                              <div class="min-w-0 flex-auto">
                                <p class="text-sm font-semibold leading-6 text-gray-900">No Alerts</p>
                                <p class="mt-1 truncate text-xs leading-5 text-gray-500">:(</p>
                              </div>
                            </div>
                          </MenuItem>
                        </ul>
                        <div class="flex justify-center rounded-b-md bg-gray-200">
                          <button
                            class="mx-3 my-1.5 flex w-48 items-center justify-center rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-gray-300 hover:bg-indigo-500 focus-visible:outline-offset-0"
                            @click="showPopup = true"
                          >
                            View all
                          </button>
                        </div>
                      </MenuItems>
                    </transition>
                  </div>
                </Menu>

                <!-- Alert Popup -->
                <div
                  v-if="showPopup"
                  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 dark:bg-white/20"
                >
                  <div class="max-h-[600px] w-[1024px] max-w-5xl rounded-lg bg-gray-100 py-10 dark:bg-gray-900">
                    <div class="flex-auto px-8">
                      <h1 class="text-base font-semibold leading-6 text-gray-800 dark:text-white">Alert Center</h1>
                      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">A list of all the current alerts</p>
                    </div>
                    <div class="max-h-96 overflow-y-auto px-8 align-middle">
                      <table class="w-full divide-y divide-gray-700">
                        <thead class="sticky top-0 w-full bg-gray-100 dark:bg-gray-900">
                          <tr>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Alert
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            >
                              Messages
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white"
                            ></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-500">
                          <tr
                            v-for="alert in sortedAlerts"
                            :key="alert.id"
                            :class="{ 'bg-gray-200 dark:bg-gray-800': !alert.TirNotifications_Users[0].read }"
                          >
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">
                              {{ formartAlertDate(alert.creationDate) }}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">
                              {{ alert.NotificationCategory?.category || "Unknown" }}
                            </td>
                            <td class="whitespace-pre-line px-3 py-4 text-sm text-gray-800 dark:text-gray-300">
                              {{ alert.message || "" }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <button class="text-red-600 hover:text-red-900" @click="deleteTheAlert(alert.id)">
                                <TrashIcon class="h-5 w-5" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button
                      class="front-bold mx-8 mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                      @click="showPopup = false"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <header class="py-10">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
            {{ headerTitle }}
          </h1>
        </div>
      </header>
    </div>
    <div v-else class="flex min-h-full items-center justify-center">
      <p>Loading...</p>
    </div>
    <Notifications />
  </div>
</template>

<script setup>
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { XMarkIcon, UserIcon, BellIcon, TrashIcon, QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch } from "vue";
import { DateTime } from "luxon";
import inflection from "inflection";
import { useRoute, useRouter } from "vue-router";
import { useColorMode, useId, useAsyncData } from "#imports";
import { useBreadcrumbStore } from "~~/stores/Breadcrumb";
import { useAliasStore } from "~/stores/AliasStorage";
import { useAlertsStore } from "~~/stores/AlertsStore";
import Notifications from "~/components/Notifications.vue";

const id = useId();
const route = useRoute();
const router = useRouter();
const colorMode = useColorMode();
const breadStore = useBreadcrumbStore();
const aliasStore = useAliasStore();
const alertsStore = useAlertsStore();
const showPopup = ref(false);

const { data: currentUser, error: userError } = useAsyncData(
  "currentUser",
  async () => {
    try {
      return await $fetch("/api/auth/currentUser", {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to fetch currentUser:", err);
      return null;
    }
  },
  { server: false },
);

// Fetch alerts only after currentUser is available
const { data: currentAlert, refresh: refreshAlerts } = useAsyncData(
  "currentAlert",
  async () => {
    if (!currentUser.value?.id) return null;
    return await $fetch("/api/config/alert", {
      method: "GET",
      query: { userId: currentUser.value.id },
      credentials: "include",
    });
  },
  { watch: [currentUser] }, // Re-fetch whenever `currentUser` changes
);
// Fetch about data
const { data: currentAbout } = useAsyncData("currentAbout", async () => {
  try {
    return await $fetch("/api/config/about", { method: "GET" });
  } catch (error) {
    console.error("Failed to fetch about data:", error);
    return null; // Return null on error
  }
});

// Check if data is ready
const isDataReady = computed(() => !!currentUser.value && !userError.value && navigation.value.length > 0);

// Theme handling
watch(
  currentUser,
  (newUser) => {
    if (newUser?.Theme) {
      colorMode.preference = newUser.Theme.name.toLowerCase();
    } else {
      colorMode.preference = "system";
    }
  },
  { immediate: true },
);

const isAdmin = computed(() => currentUser.value?.UserRole?.name === "Admin" || false);

const navigation = computed(() => {
  try {
    if (!currentUser.value) return [];

    const path = route.fullPath;

    const items = [
      {
        name: "Dashboard",
        href: "/dashboard",
        header: "Welcome to TIR",
        current: path.startsWith("/dashboard"),
        adminReq: false,
      },
      {
        name: inflection.pluralize(aliasStore.BoundaryAlias || "Boundary"),
        href: "/company-boundary",
        header: inflection.pluralize(aliasStore.BoundaryAlias || "Boundary"),
        current: path.startsWith("/company-boundary"),
        adminReq: false,
      },
      {
        name: "Libraries",
        href: "/libraries",
        header: "Libraries",
        current: path.startsWith("/libraries"),
        adminReq: false,
      },
      {
        name: "Administration",
        href: "/administration/general",
        header: "Administration",
        current: path.startsWith("/administration/"),
        adminReq: true,
      },
    ];

    return items.filter((item) => !item.adminReq || isAdmin.value);
  } catch (error) {
    console.error("Navigation error:", error);
    return [];
  }
});

const userNavigation = computed(() => {
  if (!currentUser.value) return [];
  return [
    { name: "Your Profile", href: "/profile/" + (currentUser.value.email || "unknown") },
    { name: "Sign out", onClick: logoutUser },
  ];
});

const headerTitle = computed(() => {
  const currentItem = navigation.value.find((item) => item.current);
  return currentItem ? currentItem.header : "Welcome to TIR";
});

function checkTab(name) {
  if (name === "Boundaries") {
    breadStore.pages.length = 0;
    breadStore.tierId = null;
  }
}

function clearStorage() {
  localStorage.removeItem("nuxt-color-mode");
}

const userBell = computed(() => {
  if (!currentAlert.value) return [];
  return currentAlert.value
    .filter((alert) => alert?.TirNotifications_Users?.[0]?.read === false)
    .map((alert) => ({
      ...alert,
      userId: alert.TirNotifications_Users?.[0]?.UserId || null,
      category: `Alert: ${alert.NotificationCategory?.category || "Unknown"}`,
      message: alert.message || "",
      read: alert.TirNotifications_Users?.[0]?.read || false,
      href: "#",
      date: formartAlertDate(alert.creationDate),
    }))
    .sort((a, b) => DateTime.fromISO(b.creationDate).toMillis() - DateTime.fromISO(a.creationDate).toMillis());
});

const sortedAlerts = computed(() => {
  if (!currentAlert.value) return [];
  return currentAlert.value
    .slice()
    .sort((a, b) => DateTime.fromISO(b.creationDate).toMillis() - DateTime.fromISO(a.creationDate).toMillis());
});

const unreadAlertCount = computed(() => {
  return currentAlert.value?.filter((alert) => alert?.TirNotifications_Users?.[0]?.read === false).length || 0;
});

const dateCleaner = computed(() => {
  if (currentAbout.value?.date) {
    const dateObj = new Date(currentAbout.value.date);
    return dateObj.toLocaleDateString();
  }
  return "";
});

function formartAlertDate(isoDate) {
  return DateTime.fromISO(isoDate).toLocaleString({
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const markAsRead = async (alertId) => {
  try {
    const response = await fetch("/api/config/alertRead", {
      method: "PUT",
      body: JSON.stringify({ id: alertId }),
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    if (!responseData.success) {
      console.error("Failed to mark alert as read");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const resetInput = async (alert) => {
  event.stopPropagation();
  const alertId = alert.id;
  await markAsRead(alertId);
  const alertIndex = currentAlert.value.findIndex((a) => a.id === alertId);
  if (alertIndex !== -1) {
    currentAlert.value[alertIndex].TirNotifications_Users[0].read = true;
    currentAlert.value = [...currentAlert.value];
  } else {
    console.error("Alert not found in currentAlert.value");
  }
};

const deleteTheAlert = async (alertId) => {
  const prevAlert = [...currentAlert.value];
  currentAlert.value = currentAlert.value.filter((alert) => alert.id !== alertId);
  try {
    const response = await fetch("/api/config/alert", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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

watch(
  currentUser,
  (newUser) => {
    if (newUser?.id) {
      alertsStore.startPolling(newUser.id);
    } else {
      alertsStore.stopPolling();
    }
  },
  { immediate: true },
);

async function logoutUser() {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    // Clear frontend state
    currentUser.value = null;

    // Stop polling alerts
    alertsStore.stopPolling();

    // Redirect to login page
    router.push("/");

  } catch (error) {
    console.error("Logout error:", error);
  }
}
</script>
