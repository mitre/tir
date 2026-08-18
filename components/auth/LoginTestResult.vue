<template>
  <div class="rounded border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800">
    <template v-if="result.error">
      <p class="text-red-500">{{ result.error }}</p>
    </template>
    <template v-else>
      <div class="mb-1 flex items-center gap-2">
        <UIcon
          :name="result.denied ? 'i-heroicons-x-circle' : 'i-heroicons-check-circle'"
          :class="result.denied ? 'text-red-500' : 'text-green-500'"
          class="h-4 w-4 shrink-0"
        />
        <span class="font-medium">{{ result.denied ? "Access denied — not in any mapped group" : "Access granted" }}</span>
      </div>
      <div class="mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
        <p>
          <span class="font-medium">User:</span> {{ result.firstName }} {{ result.lastName }} ({{ result.email }})
        </p>
        <p>
          <span class="font-medium">Role:</span>
          {{ result.userRoleId === 1 ? "Admin" : result.denied ? "None" : "User" }}
        </p>
        <p>
          <span class="font-medium">Groups:</span>
          {{ result.groups?.length ? result.groups.join(", ") : "none" }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { LoginTestResult } from "~/types/auth";

defineProps<{
  result: Omit<LoginTestResult, "loading">;
}>();
</script>
