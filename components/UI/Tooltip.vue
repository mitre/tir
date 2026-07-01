<template>
  <UTooltip
    v-bind="$attrs"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <slot />
    <template
      v-if="$slots.text"
      #text
    >
      <slot name="text" />
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
defineOptions({ name: "UITooltip", inheritAttrs: false });

const onFocusin = (e: FocusEvent) =>
  (e.currentTarget as HTMLElement).dispatchEvent(new MouseEvent("mouseenter"));
const onFocusout = (e: FocusEvent) =>
  (e.currentTarget as HTMLElement).dispatchEvent(new MouseEvent("mouseleave"));
</script>
