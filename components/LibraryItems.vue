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
        <UProgress :value="barProgressStig" max="100" />
        <p v-if="messageLoadStig" class="truncate text-xs text-gray-500 dark:text-gray-400">
          {{ messageLoadStig }}
        </p>
      </div>

      <LibraryItemsStigLibrary :refresh-trigger="refreshFlag" :active-imports="jobsByLibrary" />

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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { Duration } from "luxon";
import { useUploadStream } from "~/composables/useUploadStream";
import type { ProgressMessage } from "~/types/progress";

const notificationStore = useNotificationStore();
const alertsStore = useAlertsStore();

type Phase = "uploading" | "processing" | "done" | "error";
interface ImportJobView {
  jobId: string;
  filename: string;
  phase: Phase;
  percent: number;
  message: string;
  stigLibraryId: number | null;
}

// client progress state is ephemeral - the server (ImportJob + SSE replay) is authoritative
const jobs = reactive<Record<string, ImportJobView>>({});
const sources = new Map<string, EventSource>();
let activeUpload: { abort: () => void } | null = null;

function upsert(jobId: string, patch: Partial<ImportJobView>) {
  jobs[jobId] = { ...jobs[jobId], ...patch } as ImportJobView;
}

function closeSource(jobId: string) {
  sources.get(jobId)?.close();
  sources.delete(jobId);
}

function dismiss(jobId: string) {
  closeSource(jobId);
  delete jobs[jobId];
}

function applyMessage(jobId: string, msg: ProgressMessage) {
  const filename = jobs[jobId]?.filename;
  switch (msg.type) {
    case "progress":
      upsert(jobId, { percent: Math.round(msg.value) });
      break;
    case "status":
      upsert(jobId, { message: msg.value });
      break;
    case "saved":
      upsert(jobId, { stigLibraryId: msg.value });
      refreshData();
      break;
    case "complete": {
      const failed = msg.failed ?? 0;
      upsert(jobId, { phase: "done", percent: 100, message: msg.value || "Processing complete!" });
      closeSource(jobId);
      refreshData();
      alertsStore.refresh();
      notificationStore.addNotification({
        type: failed > 0 ? "error" : "success",
        message:
          failed > 0
            ? `Import of ${filename || "STIG library"} finished with failures: ${msg.value}`
            : `Completed import of ${filename || "STIG library"}`,
      });
      setTimeout(() => dismiss(jobId), failed > 0 ? 30000 : 6000);
      break;
    }
    case "error":
      upsert(jobId, { phase: "error", message: msg.value });
      closeSource(jobId);
      notificationStore.addNotification({ type: "error", message: msg.value });
      break;
  }
}

function subscribe(jobId: string, filename = "") {
  if (sources.has(jobId)) return;
  if (!jobs[jobId]) {
    upsert(jobId, { jobId, filename, phase: "processing", percent: 0, message: "", stigLibraryId: null });
  }
  const eventSource = new EventSource(`/api/stigLibrary/jobs/${jobId}/events`);
  sources.set(jobId, eventSource);
  eventSource.onmessage = (event) => {
    let msg: ProgressMessage;
    try {
      msg = JSON.parse(event.data) as ProgressMessage;
    } catch {
      return;
    }
    applyMessage(jobId, msg);
  };
}

function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 1) return "<1s";
  return Duration.fromObject({ seconds: Math.round(seconds) })
    .rescale()
    .toHuman({ unitDisplay: "short" });
}

async function startStigUpload(file: File) {
  let jobId: string;
  try {
    ({ jobId } = await $fetch<{ jobId: string }>("/api/stigLibrary/jobs", {
      method: "POST",
      body: { filename: file.name },
    }));
  } catch (error) {
    const message =
      (error as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      "Unable to start the import.";
    notificationStore.addNotification({ type: "error", message });
    return;
  }

  upsert(jobId, {
    jobId,
    filename: file.name,
    phase: "uploading",
    percent: 0,
    message: "Starting upload...",
    stigLibraryId: null,
  });
  subscribe(jobId, file.name);

  const tus = await import("tus-js-client");
  let startTime: number | null = null;
  let startSent = 0;
  const upload = new tus.Upload(file, {
    endpoint: "/api/uploads",
    retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
    chunkSize: 8 * 1024 * 1024,
    removeFingerprintOnSuccess: true,
    metadata: { filename: file.name, jobId },
    onProgress: (sent, total) => {
      if (!total || jobs[jobId]?.phase !== "uploading") return;
      const percent = Math.floor((sent / total) * 100);
      if (startTime === null) {
        startTime = Date.now();
        startSent = sent;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = elapsed > 0 ? (sent - startSent) / elapsed : 0;
      const eta = rate > 0 ? formatEta((total - sent) / rate) : "";
      upsert(jobId, {
        percent,
        message: eta ? `Uploading ${percent}% - ~${eta} left` : `Uploading ${percent}%`,
      });
    },
    onSuccess: () => {
      if (jobs[jobId]?.phase === "uploading") {
        upsert(jobId, { phase: "processing", percent: 0, message: "Upload complete. Processing..." });
      }
    },
    onError: () => {
      upsert(jobId, { phase: "error", message: "Upload failed." });
      closeSource(jobId);
      notificationStore.addNotification({ type: "error", message: "STIG library upload failed." });
    },
  });
  activeUpload = upload;
  upload.start();
}

async function resumeActive() {
  try {
    const active = await $fetch<
      { jobId: string; filename: string; percent: number; message: string; stigLibraryId: number | null }[]
    >("/api/stigLibrary/jobs");
    let added = 0;
    for (const job of active) {
      if (sources.has(job.jobId)) continue;
      upsert(job.jobId, {
        jobId: job.jobId,
        filename: job.filename,
        phase: "processing",
        percent: job.percent ?? 0,
        message: job.message || "",
        stigLibraryId: job.stigLibraryId ?? null,
      });
      subscribe(job.jobId, job.filename);
      added += 1;
    }
    if (added > 0) refreshData();
  } catch {
    // best-effort reattach, fine to ignore
  }
}

const pendingStigJob = computed(
  () =>
    Object.values(jobs).find(
      (j) => (j.phase === "uploading" || j.phase === "processing") && !j.stigLibraryId,
    ) || null,
);
const uploadingStig = computed(() => !!pendingStigJob.value);
const barProgressStig = computed(() => pendingStigJob.value?.percent ?? 0);
const messageLoadStig = computed(() => pendingStigJob.value?.message ?? "");

const jobsByLibrary = computed<Record<number, ImportJobView>>(() => {
  const map: Record<number, ImportJobView> = {};
  for (const job of Object.values(jobs)) {
    if (job.stigLibraryId && (job.phase === "processing" || job.phase === "done")) {
      map[job.stigLibraryId] = job;
    }
  }
  return map;
});

const uploadingCci = ref(false);
const barProgressCci = ref(0);
const messageLoadCci = ref("");
const uploadDoneCci = ref(false);

const refreshFlag = ref(false);
const refreshCciFlag = ref(false);

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
    notificationStore.addNotification({
      type: "error",
      message: data.value.message || "Invalid STIG file",
    });
    return;
  }

  await startStigUpload(selectedFile);
}

onMounted(() => resumeActive());
onBeforeUnmount(() => {
  sources.forEach((es) => es.close());
  sources.clear();
  activeUpload?.abort();
});

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
