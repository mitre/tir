<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="dirty || saving || showSaved"
      class="sticky bottom-0 z-30 mt-8 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-gray-800/95"
    >
      <div class="flex items-center justify-between gap-4">
        <!-- Status -->
        <span class="flex items-center gap-2 text-sm">
          <span
            v-if="saving"
            class="flex items-center gap-2 text-gray-500 dark:text-gray-400"
          >
            <ArrowPathIcon class="h-4 w-4 animate-spin" />
            Saving&hellip;
          </span>
          <span
            v-else-if="!dirty"
            class="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircleIcon class="h-4 w-4" />
            All changes saved
          </span>
          <span
            v-else
            class="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400"
          >
            <ExclamationTriangleIcon class="h-4 w-4" />
            You have unsaved changes
          </span>
        </span>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="!dirty || saving"
            class="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-40 dark:text-gray-200 dark:hover:bg-white/5"
            @click="emit('discard')"
          >
            Discard
          </button>
          <button
            type="button"
            :disabled="!dirty || saving"
            class="inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 dark:focus-visible:ring-offset-gray-800"
            @click="emit('save')"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  dirty: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (event: "save"): void;
  (event: "discard"): void;
}>();

const showSaved = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.saving,
  (now, prev) => {
    if (prev && !now && !props.dirty) {
      showSaved.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => (showSaved.value = false), 2600);
    }
  },
);
</script>
