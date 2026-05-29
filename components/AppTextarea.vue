<template>
  <textarea
    :class="[
      'rounded border px-2 py-1 placeholder:text-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
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
