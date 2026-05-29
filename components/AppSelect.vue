<template>
  <select
    :class="[
      'rounded border px-2 py-1 dark:bg-gray-800 dark:text-white',
      size === 'xs' ? 'text-xs' : 'text-sm',
    ]"
    v-bind="$attrs"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{ modelValue?: string; size?: "xs" | "sm" }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>
