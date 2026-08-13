<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-10" @close="$emit('cancel')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="sm:flex sm:items-start">
                <div
                  v-if="danger"
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-gray-100 dark:bg-gray-800 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-gray-100">
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p v-if="message" class="text-sm text-gray-600 dark:text-gray-300">
                      {{ message }}
                    </p>
                    <slot />
                    <label v-if="showInput" for="modal-dialog-input" class="sr-only">{{ title }}</label>
                    <input
                      v-if="showInput"
                      id="modal-dialog-input"
                      ref="inputRef"
                      v-model="inputText"
                      type="text"
                      :placeholder="placeholder"
                      class="mt-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-white dark:ring-gray-600 sm:text-sm"
                      @keyup.enter="!busy && $emit('confirm', inputText)"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  :disabled="busy"
                  class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 sm:ml-3 sm:w-auto"
                  :class="danger ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'"
                  @click="$emit('confirm', showInput ? inputText : undefined)"
                >
                  {{ busy ? busyText : confirmText }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="$emit('cancel')"
                >
                  {{ cancelText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  confirmText: { type: String, default: "Confirm" },
  busyText: { type: String, default: "Working..." },
  cancelText: { type: String, default: "Cancel" },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  showInput: { type: Boolean, default: false },
  initialValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
});

defineEmits(["confirm", "cancel"]);

const inputRef = ref(null);
const inputText = ref("");

watch(
  () => props.show,
  (shown) => {
    if (!shown) return;
    inputText.value = props.initialValue;
    if (props.showInput) nextTick(() => inputRef.value?.focus());
  },
);
</script>
