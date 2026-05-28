<template>
  <input
    :class="[
      'rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:ring-white/10 sm:leading-6',
      size === 'xs' ? 'text-xs' : 'text-sm',
    ]"
    v-bind="$attrs"
    :value="modelValue"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: string | number;
  size?: "xs" | "sm";
  modelModifiers?: { number?: boolean };
}>();
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  if (props.modelModifiers?.number) {
    const n = parseFloat(raw);
    emit("update:modelValue", isNaN(n) ? raw : n);
  } else {
    emit("update:modelValue", raw);
  }
}
</script>
