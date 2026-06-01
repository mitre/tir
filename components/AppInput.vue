<template>
  <input
    :class="[
      'rounded border px-2 py-1 placeholder:text-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
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
    const n = Number.parseFloat(raw);
    emit("update:modelValue", Number.isNaN(n) ? raw : n);
  } else {
    emit("update:modelValue", raw);
  }
}
</script>
