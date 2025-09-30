<template>
  <nav class="flex-none px-4 sm:px-6 lg:px-0">
    <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
      <li v-for="item in links" :key="item.name">
        <a
          :class="[
            isCurrent(item.href)
              ? 'bg-gray-100 text-indigo-600 dark:bg-gray-50'
              : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-50 dark:hover:text-indigo-600',
            'group flex cursor-pointer gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6',
          ]"
          @click.prevent="router.push(item.href)"
        >
          <component
            :is="item.icon"
            :class="[
              isCurrent(item.href) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600 dark:text-gray-100',
              'h-6 w-6 shrink-0',
            ]"
            aria-hidden="true"
          />
          {{ item.name }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import {
  BellIcon,
  WrenchIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  KeyIcon,
  IdentificationIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();

const links = [
  { name: "General", href: "/administration/general", icon: UserCircleIcon },
  { name: "Configuration", href: "/administration/configuration", icon: WrenchIcon },
  { name: "Notifications", href: "#", icon: BellIcon },
  { name: "Users", href: "/administration/team-members", icon: UsersIcon },
  { name: "Logs", href: "/administration/logs", icon: DocumentDuplicateIcon },
  { name: "Security", href: "/administration/security", icon: ShieldCheckIcon },
  { name: "Auth", href: "/administration/auth", icon: IdentificationIcon },
];

function isCurrent(href: string) {
  return route.path.startsWith(href);
}
</script>
