<template>
  <!-- Global notification live region, render this permanently at the end of the document -->
  <div aria-live="off" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
      <TransitionRoot as="template" :show="show">
        <Dialog as="div" class="relative z-10" @close="$emit('show', false)">
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
                  class="relative transform overflow-hidden rounded-lg bg-gray-200 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
                >
                  <div>
                    <div class="flex h-7 items-center">
                      <button
                        type="button"
                        class="rounded-md bg-gray-200 text-indigo-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-900 dark:text-indigo-200"
                        @click="$emit('show', false)"
                      >
                        <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div class="text-center">
                      <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-white"
                        >{{ msg }}
                      </DialogTitle>
                      <div class="mb-12 mt-2">
                        <p class="text-sm text-black dark:text-white">Please Wait...</p>
                      </div>
                      <div class="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2">
                        <svg
                          class="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                          viewBox="0 0 24 24"
                        ></svg>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/20/solid";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  error: { type: Object, default() {} },
});

const { show, msg } = props;
</script>
