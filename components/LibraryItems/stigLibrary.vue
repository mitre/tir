<template>
  <div class="flow-root py-10">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="w-full table-fixed divide-y divide-gray-800">
            <thead class="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  class="w-[12%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-6"
                >
                  Classification
                </th>
                <th
                  scope="col"
                  class="w-[13%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  Library Date
                </th>
                <th
                  scope="col"
                  class="w-[10%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  Revision
                </th>
                <th
                  scope="col"
                  class="w-[7%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  STIGs
                </th>
                <th
                  scope="col"
                  class="w-[24%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  File
                </th>
                <th
                  scope="col"
                  class="w-[24%] py-3.5 pl-8 pr-4 text-left text-sm font-semibold text-gray-800 dark:text-white"
                >
                  Import Date
                </th>
                <th
                  v-if="isAdmin"
                  scope="col"
                  class="w-[10%] py-3.5 pl-4 pr-4 text-right text-sm font-semibold text-gray-800 dark:text-white sm:pr-6"
                >
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 bg-gray-100 dark:bg-gray-900">
              <tr v-for="library in sortedLibraries" :key="library.id">
                <td class="w-[12%] py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-6">
                  {{ library.classification }}
                </td>
                <td class="w-[13%] py-4 pl-4 pr-3 text-sm text-gray-800 dark:text-gray-200">
                  {{ formatLibraryDate(library.libraryDate) }}
                </td>
                <td class="w-[10%] py-4 pl-4 pr-3 text-sm text-gray-800 dark:text-gray-200">
                  <span :title="library.labelSource === 'admin' ? 'Label set by an administrator' : 'Derived label'">
                    {{ library.revisionLabel || "-" }}
                  </span>
                </td>
                <td class="w-[7%] py-4 pl-4 pr-3 text-left text-sm text-gray-800 dark:text-gray-200">
                  {{ library.stigCount }}
                </td>
                <td class="w-[24%] py-4 pl-4 pr-3 text-sm text-gray-800 dark:text-gray-200">
                  <div class="truncate" :title="library.filename">{{ library.filename }}</div>
                </td>
                <td class="relative w-[24%] py-4 pl-8 pr-4 text-sm">
                  <div class="w-full">
                    <template v-if="jobFor(library.id)">
                      <UProgress
                        :value="jobFor(library.id).percent"
                        max="100"
                        :color="jobFor(library.id).phase === 'done' ? 'green' : 'primary'"
                      />
                      <p class="truncate text-left text-xs text-gray-500 dark:text-gray-400">
                        {{ jobFor(library.id).message }}
                      </p>
                    </template>
                    <span v-else class="text-gray-800 dark:text-gray-200">
                      {{ formatCompleted(library.importedDate) }}
                    </span>
                  </div>
                </td>
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
                <td v-if="isAdmin" class="w-[10%] py-4 pl-4 pr-4 text-right text-sm sm:pr-6">
                  <button
                    class="mr-3 align-middle text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    title="Edit revision label (empty resets to automatic)"
<<<<<<< Updated upstream
                    @click="renameLabel(library)"
=======
                    @click="labelTarget = library"
>>>>>>> Stashed changes
                  >
                    <PencilSquareIcon class="h-5 w-5" aria-hidden="true" />
                    <span class="sr-only">Edit revision label</span>
                  </button>
                  <button
<<<<<<< Updated upstream
                    class="align-middle text-red-600 hover:text-red-500 disabled:opacity-50 dark:text-red-400"
                    title="Delete library"
                    :disabled="deletingId === library.id"
                    @click="deleteLibrary(library)"
                  >
                    <TrashIcon class="h-5 w-5" :class="{ 'animate-pulse': deletingId === library.id }" aria-hidden="true" />
                    <span class="sr-only">Delete library</span>
                  </button>
                </td>
=======
                    class="align-middle text-red-600 hover:text-red-500 dark:text-red-400"
                    title="Delete library"
                    @click="deleteTarget = library"
                  >
                    <TrashIcon class="h-5 w-5" aria-hidden="true" />
                    <span class="sr-only">Delete library</span>
                  </button>
                </td>
>>>>>>> Stashed changes
>>>>>>> Stashed changes
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalDialog
      :show="!!labelTarget"
      title="Edit revision label"
      :message="
        labelTarget
          ? `${libraryName(labelTarget)} (${labelTarget.filename}). Leave empty to reset to the automatic label.`
          : ''
      "
      confirm-text="Save"
      :initial-value="labelTarget?.revisionLabel || ''"
      placeholder="e.g. Q3 v2"
      show-input
      @confirm="saveLabel"
      @cancel="labelTarget = null"
    />

    <ModalDialog
      :show="!!deleteTarget"
      :title="deleteTarget ? `Delete ${libraryName(deleteTarget)}?` : ''"
      :message="
        deleteTarget
          ? `${deleteTarget.filename} and any STIGs that exist only in this library will be permanently removed. This cannot be undone.`
          : ''
      "
      confirm-text="Delete"
      busy-text="Deleting..."
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
<<<<<<< Updated upstream
import { DateTime } from "luxon";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";

const notificationStore = useNotificationStore();

const { data: StigLibraries, refresh } = useFetch("/api/stigLibrary/");
=======
const { data: StigLibraries, refresh } = useFetch("/api/stigLibrary/");
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
const { data: currentUser } = useFetch("/api/auth/currentUser");

const isAdmin = computed(() => currentUser.value?.UserRole?.id === 1);

const sortedLibraries = computed(() =>
  [...(StigLibraries.value ?? [])].sort(
    (a, b) =>
      (b.libraryDate ?? "").localeCompare(a.libraryDate ?? "") ||
      (b.revisionLabel ?? "").localeCompare(a.revisionLabel ?? "") ||
      b.id - a.id,
  ),
);

function jobFor(libraryId) {
  return props.activeImports[libraryId] || null;
}

<<<<<<< Updated upstream
async function renameLabel(library) {
  const input = window.prompt(
    `Revision label for library ${library.id} (${library.filename}).\nLeave empty to reset to the automatic label.`,
    library.revisionLabel || "",
  );
  if (input === null) return;
  try {
    await $fetch(`/api/stigLibrary/${library.id}/label`, {
      method: "PUT",
      body: { label: input.trim() || null },
=======
const labelTarget = ref(null);
const deleteTarget = ref(null);
const deleting = ref(false);

function libraryName(library) {
  return [library.classification, formatLibraryDate(library.libraryDate), library.revisionLabel]
    .filter(Boolean)
    .join(" ");
}

async function saveLabel(value) {
  const library = labelTarget.value;
  labelTarget.value = null;
  if (!library) return;
  try {
    await $fetch(`/api/stigLibrary/${library.id}/label`, {
      method: "PUT",
      body: { label: value.trim() || null },
>>>>>>> Stashed changes
    });
    await refresh();
  } catch (error) {
    notificationStore.addNotification({
      type: "error",
      message: error?.data?.statusMessage || "Failed to update the label.",
    });
  }
}

<<<<<<< Updated upstream
const deletingId = ref(null);

async function deleteLibrary(library) {
  const name = [library.classification, formatLibraryDate(library.libraryDate), library.revisionLabel]
    .filter(Boolean)
    .join(" ");
  if (!window.confirm(`Delete STIG library ${name} (${library.filename})? This cannot be undone.`)) {
    return;
  }
  deletingId.value = library.id;
=======
async function confirmDelete() {
  const library = deleteTarget.value;
  if (!library) return;
  deleting.value = true;
>>>>>>> Stashed changes
  try {
    const result = await $fetch(`/api/stigLibrary/${library.id}`, { method: "DELETE" });
    notificationStore.addNotification({
      type: "success",
<<<<<<< Updated upstream
      message: `Deleted library ${name}: ${result.removedStigs} STIG(s) removed, ${result.detachedStigs} shared STIG(s) kept.`,
=======
      message: `Deleted library ${libraryName(library)}: ${result.removedStigs} STIG(s) removed, ${result.detachedStigs} shared STIG(s) kept.`,
>>>>>>> Stashed changes
    });
    await refresh();
  } catch (error) {
    notificationStore.addNotification({
      type: "error",
      message: error?.data?.statusMessage || "Failed to delete the library.",
    });
  } finally {
<<<<<<< Updated upstream
    deletingId.value = null;
=======
    deleting.value = false;
    deleteTarget.value = null;
>>>>>>> Stashed changes
  }
}

function formatLibraryDate(libraryDate) {
  if (!libraryDate) return "";
  const dt = DateTime.fromISO(libraryDate);
  return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : libraryDate;
}

// legacy rows are date-only, newer ones full ISO datetime
function formatCompleted(importedDate) {
  if (!importedDate) return "";
  const dt = DateTime.fromISO(importedDate);
  if (!dt.isValid) return importedDate;
  return importedDate.includes("T")
    ? dt.toLocaleString(DateTime.DATETIME_MED)
    : dt.toLocaleString(DateTime.DATE_MED);
}
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes

const props = defineProps({
  refreshTrigger: {
    type: Boolean,
    default: false,
  },
  activeImports: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => props.refreshTrigger,
  () => refresh(),
);
</script>
