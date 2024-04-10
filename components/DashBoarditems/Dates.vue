<template>
  <ul role="list" class="w-full divide-y divide-gray-500">
    <li v-for="alert in sortedAlerts" :key="alert.id" class="flex items-center justify-between gap-x-6 py-5">
      <div class="min-w-0">
        <div class="flex items-start gap-x-3">
          <p class="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">{{ alert.category }}</p>
        </div>
        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
          <p class="whitespace-nowrap">
            On <time>{{ alert.dueDate }}</time>
          </p>
        </div>
      </div>
      <div class="flex flex-none items-center gap-x-4">
        <Menu as="div" class="relative flex-none">
          <MenuButton class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
            <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
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
              class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
            >
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                  >Edit</a
                >
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                  >Move</a
                >
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                  >Delete</a
                >
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { DateTime } from "luxon";

const { data: currentUser } = await useFetch("/api/auth/currentUser");

const { data: currentAlert } = await useFetch("/api/config/alert", {
  method: "GET",
  query: { userId: currentUser.value.id },
});
currentAlert.value = currentAlert.value.filter((obj) => obj.category !== "New STIG Library Available");
const sortedAlerts = computed(() => {
  if (!currentAlert.value) {
    return [];
  } else if (currentAlert.value.length > 3) {
    currentAlert.value.sort(
      (a, b) => DateTime.fromISO(a.dueDate).toSeconds() - DateTime.fromISO(b.dueDate).toSeconds(),
    );
    currentAlert.value.length = 3;
  }
  return currentAlert.value;
});
</script>
