<template>
  <div
    v-if="result?.checks"
    class="space-y-1 rounded border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800"
  >
    <div
      v-for="check in result.checks"
      :key="check.name"
      class="flex items-center gap-2"
    >
      <UIcon
        :name="check.ok ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
        :class="check.ok ? 'text-green-500' : 'text-red-500'"
        class="h-4 w-4 shrink-0"
      />
      <span class="font-medium">{{ check.name }}</span>
      <span class="text-gray-400">— {{ check.message }}</span>
    </div>
  </div>
  <p
    v-if="result?.error"
    class="text-xs text-red-500"
  >
    {{ result.error }}
  </p>
</template>

<script setup lang="ts">
import type { ConnectionTestResult } from "~/types/auth";

defineProps<{
  result?: ConnectionTestResult;
}>();
</script>
