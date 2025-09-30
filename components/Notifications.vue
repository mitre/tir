<template>
  <div aria-live="polite" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <transition-group
        name="notification-fade"
        enter-active-class="transition ease-out duration-300"
        leave-active-class="transition ease-in duration-200"
      >
        <div
          v-for="note in notificationStore.queue"
          :key="note.id"
          class="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
        >
          <div class="flex items-start p-4">
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="note.type === 'success'" class="h-6 w-6 text-green-400" />
              <XCircleIcon v-else class="h-6 w-6 text-red-400" />
            </div>
            <div class="ml-3 flex-1">
              <p v-if="note.title" class="mb-1 text-sm font-bold text-gray-900 dark:text-white">
                {{ note.title }}
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ note.message }}</p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-800 dark:hover:text-gray-500"
                @click="notificationStore.removeNotificationById(note.id)"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import { XMarkIcon } from "@heroicons/vue/20/solid";
import { useNotificationStore } from "~/stores/NotificationStore";

const notificationStore = useNotificationStore();
</script>

<style scoped>
.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
  max-height: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    max-height 0.3s ease,
    padding 0.3s ease,
    margin 0.3s ease;
}

.notification-fade-enter-to,
.notification-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 100px;
  margin: 1rem 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
