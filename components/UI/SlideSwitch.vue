<template>
  <div class="flex items-center space-x-4">
    <label v-if="label" class="text-sm text-gray-800 dark:text-white">
      {{ label }}
    </label>
    <Switch
      :id="id"
      :model-value="modelValue"
      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
      :class="modelValue ? 'bg-indigo-600' : 'bg-gray-200'"
      @update:model-value="onToggle"
    >
      <span class="sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        :class="[
          modelValue ? 'translate-x-5' : 'translate-x-0',
          'inline-block h-5 w-5 transform rounded-full bg-white ring-1 ring-gray-300 transition duration-200 ease-in-out',
        ]"
      />
    </Switch>
  </div>
</template>

<script setup lang="ts">
import { Switch } from "@headlessui/vue";

defineProps<{
  modelValue: boolean;
  label?: string;
  id?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

function onToggle(value: boolean) {
  emit("update:modelValue", value);
}
</script>
