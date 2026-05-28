<template>
  <textarea
    :class="[
      'rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:ring-white/10 sm:leading-6',
      size === 'xs' ? 'text-xs' : 'text-sm',
    ]"
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{ modelValue?: string; size?: "xs" | "sm" }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>
