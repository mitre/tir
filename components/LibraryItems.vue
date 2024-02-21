<template>
  <div aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <transition enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="show"
          class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <component :is="iconComponent" class="h-6 w-6"
                  :class="{ 'text-red-500': iconComponent === XCircleIcon, 'text-green-400': iconComponent === CheckCircleIcon }"
                  aria-hidden="true" />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{{ title }}</p>
                <p class="mt-1 text-sm text-gray-500"> {{ message }}</p>
              </div>
              <div class="ml-4 flex flex-shrink-0">
                <button type="button" @click="show = false"
                  class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
  <div class="bg-white dark:bg-gray-800 py-6 rounded-lg">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4 class=" mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">STIG Libraries</h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold
                              text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                              focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span>Import</span>
            <input ref="fileInputS" type='file' @change="handleStigChange" class="hidden" />
          </label>
        </div>
      </div>
      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500  lg:mx-0 lg:max-w-none lg:grid-cols-3">
      </div>
      <LibraryItemsStigLibrary />

      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4 class=" mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">CCI Matrix</h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold
                              text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                              focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span>Import</span>
            <input ref="matrixInput" type='file' @change="handleMatrixChange" class="hidden" />
          </label>
        </div>
      </div>

      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500  lg:mx-0 lg:max-w-none lg:grid-cols-3">
      </div>
      <LibraryItemsCciMatrix />
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4
            class=" relative inline-flex  pt-2 mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
            Control
            Overlays
            <span
              class="absolute inline-flex items-center rounded-md bg-gray-400/10 px-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20 -top-2 -right-0">MVP2</span>
          </h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold
                              text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                              focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span>Import</span>
            <input ref="fileInputO" type='file' @change="handleOverlayChange" class="hidden" />

          </label>
        </div>
      </div>
      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500  lg:mx-0 lg:max-w-none lg:grid-cols-3">
      </div>
      <LibraryItemsControlOverlay />

    </div>
  </div>
  <ErrorNotification v-if="showErrorNotification" :show="showErrorNotification" :msg="errorMsg"
    @show="showErrorNotification = false" />
</template>
  
<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/20/solid';

const show = ref(false)
const title = ref('')
const message = ref('')
let showErrorNotification = ref(false);
const errorMsg = ref()
const iconComponent = ref<Component>(CheckCircleIcon)

const hideNotification = () => {
  show.value = false
}

let timeoutId: number | undefined
onMounted(() => {
  //  timeoutId = window.setTimeout(hideNotification, autoCloseTimeout)
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

const displayNotification = (customTitle: string, customMessage: string, isError: boolean, timeout: number = 5000) => {
  title.value = customTitle
  message.value = customMessage
  timeoutId = window.setTimeout(hideNotification, timeout)
  if (!isError) {
    iconComponent.value = CheckCircleIcon;
  } else {
    iconComponent.value = XCircleIcon;
  }
  show.value = true
}

const fileInputS = ref<HTMLInputElement | null>(null)
const matrixInput = ref<HTMLInputElement | null>(null)
const fileInputO = ref<HTMLInputElement | null>(null)
const files = ref()

async function handleStigChange() {
  if (fileInputS.value && fileInputS.value.files && fileInputS.value.files.length > 0) {
    const selectedFile = fileInputS.value?.files[0];
    const { data } = await useFetch("/api/stigLibrary/check", { method: "POST", body: { "filename": selectedFile.name } });
    const parsingError = data.value?.error;

    if (!parsingError) {
      displayNotification("STIG Library Uploading", "Starting upload of STIG library.", false);
      const formdata = new FormData();
      formdata.append('file', selectedFile);
      const result = await useFetch("/api/stigLibrary/upload", { method: "POST", body: formdata });
      displayNotification("STIG Library Upload", "Completed upload of STIG library.", false);
    } else {
      displayNotification("STIG Library Upload Error", "The file selected does not seem to be a valid STIG Library.", true);
    }
  }
}

function handleOverlayChange() {
}
function setErrorNotification() {
  showErrorNotification.value = true;
  setTimeout(() => (showErrorNotification.value = false), 6000)
}
async function handleMatrixChange() {

  if (matrixInput.value && matrixInput.value.files && matrixInput.value.files.length > 0) {
    const selectedFile = matrixInput.value?.files[0];
    const formdata = new FormData();
    formdata.append('file', selectedFile);
    const { data: cciResult, error } = await useFetch("/api/import/cci", { method: "POST", body: formdata });
    if (error.value != null) {
      errorMsg.value = error.value.statusMessage
      setErrorNotification()
    }
    else {
      location.reload();
    }
  }
}
</script>