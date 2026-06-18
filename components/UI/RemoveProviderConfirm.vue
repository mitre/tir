<template>
  <div
    ref="root"
    class="relative"
  >
    <!-- Trigger -->
    <UTooltip
      v-if="asIcon"
      text="Remove provider"
    >
      <button
        type="button"
        aria-label="Remove provider"
        class="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-red-400"
        @click="open = !open"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </UTooltip>
    <button
      v-else
      type="button"
      class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-300 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:text-red-400 dark:ring-red-500/40 dark:hover:bg-red-500/10 dark:focus-visible:ring-offset-gray-800"
      @click="open = !open"
    >
      <TrashIcon class="h-4 w-4" />
      Remove
    </button>

    <!-- Confirm popover -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-0.5 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-0.5 opacity-0"
    >
      <div
        v-if="open"
        class="absolute right-0 z-30 mt-1.5 w-60 rounded-lg bg-white p-3 shadow-xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
      >
        <p class="text-sm font-semibold text-gray-800 dark:text-white">Remove {{ name }}?</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Users will no longer be able to sign in with this provider. This can&rsquo;t be undone.
        </p>
        <div class="mt-3 flex justify-end gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            @click="open = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
            @click="confirm"
          >
            Remove
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { TrashIcon } from "@heroicons/vue/24/outline";

withDefaults(
  defineProps<{
    name: string;
    asIcon?: boolean;
  }>(),
  { asIcon: false },
);

const emit = defineEmits<{ (event: "remove"): void }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function confirm() {
  open.value = false;
  emit("remove");
}

// Dismiss on outside click
function onPointerDown(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}
onMounted(() => document.addEventListener("pointerdown", onPointerDown, true));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onPointerDown, true));
</script>
