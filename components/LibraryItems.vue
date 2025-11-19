<template>
  <div class="rounded-lg bg-white py-6 dark:bg-gray-800">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4 class="mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">
            STIG Libraries
          </h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span>Import</span>
            <input ref="fileInputS" type="file" class="hidden" @change="handleStigChange()" />
          </label>
        </div>
      </div>
      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      ></div>
      <div v-if="uploadingStig" class="mt-2">
        <UProgress :value="barProgressStig" />
        <p v-if="messageLoadStig">{{ messageLoadStig }}</p>
      </div>

      <LibraryItemsStigLibrary
        :refresh-trigger="refreshFlag"
        :message-load="messageLoadStig"
        :bar-progress="barProgressStig"
        :current-uploading-library-id="currentUploadingLibraryId"
      />

      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4 class="mt-4 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl">CCI Matrix</h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span>Import</span>
            <input ref="matrixInput" type="file" class="hidden" @change="handleMatrixChange()" />
          </label>
        </div>
      </div>

      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      ></div>
      <div v-if="uploadingCci || uploadDoneCci" class="mt-2">
        <UProgress :value="barProgressCci" />
        <p v-if="messageLoadCci" class="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {{ messageLoadCci }}
        </p>
      </div>
      <LibraryItemsCciMatrix :refresh-trigger="refreshCciFlag" />
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h4
            class="relative mt-4 inline-flex pt-2 text-xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-2xl"
          >
            Control Overlays
            <span
              class="absolute -right-0 -top-2 inline-flex items-center rounded-md bg-gray-400/10 px-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
              >PHASE 3</span
            >
          </h4>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <label
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span>Import</span>
            <input ref="fileInputO" type="file" class="hidden" @change="handleOverlayChange()" />
          </label>
        </div>
      </div>
      <div
        class="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-500 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      ></div>
      <LibraryItemsControlOverlay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUploadStream } from "~/composables/useUploadStream";
import type { ProgressMessage } from "~/types/progress";

const notificationStore = useNotificationStore();

const uploadingStig = ref(false);
const barProgressStig = ref(0);
const messageLoadStig = ref("");

const uploadingCci = ref(false);
const barProgressCci = ref(0);
const messageLoadCci = ref("");
const uploadDoneCci = ref(false);

const refreshFlag = ref(false);
const refreshCciFlag = ref(false);
const currentUploadingLibraryId = ref<number | undefined>(undefined);

const fileInputS = ref<HTMLInputElement | null>(null);
const matrixInput = ref<HTMLInputElement | null>(null);
const fileInputO = ref<HTMLInputElement | null>(null);

function refreshData() {
  refreshFlag.value = !refreshFlag.value;
}
function refreshCCIData() {
  refreshCciFlag.value = !refreshCciFlag.value;
}

async function handleStigChange() {
  if (!fileInputS.value?.files?.length) return;

  const selectedFile = fileInputS.value.files[0];
  const { data } = await useFetch("/api/stigLibrary/check", {
    method: "POST",
    body: { filename: selectedFile.name },
  });

  if (data.value?.error) {
    notificationStore.addNotification({ type: "error", message: "Invalid STIG filename" });
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  uploadingStig.value = true;

  await useUploadStream(
    "/api/stigLibrary/upload",
    formData,
    (msg: ProgressMessage) => {
      switch (msg.type) {
        case "progress":
          barProgressStig.value = Math.round(msg.value);
          break;
        case "status":
          if (msg.value !== messageLoadStig.value) {
            messageLoadStig.value = msg.value;
          }
          break;
        case "saved":
          currentUploadingLibraryId.value = msg.value;
          refreshData();
          break;
        case "complete":
          uploadingStig.value = false;
          messageLoadStig.value = "Processing completed!";
          refreshData();
          notificationStore.addNotification({ type: "success", message: "Completed upload of STIG library" });
          break;
        case "error":
          uploadingStig.value = false;
          notificationStore.addNotification({ type: "error", message: msg.value });
          break;
      }
    },
    () => {
      uploadingStig.value = false;
    },
    (error) => {
      logger.error({ service: "STIGLibraryImport", message: `Unknown Error ${error}` });
      uploadingStig.value = false;
      notificationStore.addNotification({ type: "error", message: "Unkown Error" });
    },
    { uploadLengthHint: selectedFile.size },
  );
}

function handleOverlayChange() {}

async function handleMatrixChange() {
  if (!matrixInput.value?.files?.length) return;

  const selectedFile = matrixInput.value.files[0];
  const formData = new FormData();
  formData.append("file", selectedFile);
  uploadingCci.value = true;

  await useUploadStream(
    "/api/import/cci",
    formData,
    (msg: ProgressMessage) => {
      switch (msg.type) {
        case "progress":
          barProgressCci.value = msg.value;
          break;
        case "status":
          messageLoadCci.value = msg.value;
          break;
        case "complete":
          uploadDoneCci.value = true;
          uploadingCci.value = false;
          messageLoadCci.value = "Processing completed!";
          refreshCCIData();
          notificationStore.addNotification({ type: "success", message: "Complete upload of CCI matrix." });
          break;
        case "error":
          uploadDoneCci.value = true;
          uploadingCci.value = false;
          messageLoadCci.value = msg.value;
          notificationStore.addNotification({ type: "error", message: msg.value });
          break;
      }
    },
    () => {
      uploadingCci.value = false;
    },
    (error) => {
      logger.error({ service: "CCIImport", message: `Unknown Error ${error}` });
      uploadingCci.value = false;
      notificationStore.addNotification({ type: "error", message: "Unknown Error" });
    },
    { uploadLengthHint: selectedFile.size },
  );
}
</script>
