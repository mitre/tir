<!-- eslint-disable vue/first-attribute-linebreak -->
<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="$emit('showExport', false)">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>



      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <div>
                <div class="border-b border-gray-400 dark:border-gray-200 pb-5 sm:pb-0">
                  <div class="mt-3 sm:mt-4">

                    <div class="hidden sm:block">
                      <nav class="-mb-px flex space-x-8">
                        <a v-for="(tab, index) in tabs" :key="tab.name" :href="tab.href"
                          :class="[tab.current.value ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-800 dark:text-white hover:border-gray-300 hover:text-gray-400', 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']"
                          :aria-current="tab.current.value ? 'page' : undefined"
                          @click="[tab.current.value = true, tabeLogic(index)]">{{ tab.name }}</a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="tab1">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white">POAM
                    Creation</DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Download POAM Below</p>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="poamDownload">Download POAM</button>
                </div>
              </div>
              <!-- Finding Tab -->
              <div v-if="tab2">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white">Findings
                    Creation
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Select at least one option below</p>
                  </div>
                </div>
                <fieldset>
                  <legend class="sr-only">Notifications</legend>
                  <div class="space-y-5">
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="open" v-model="checkedStatus" value="Open" aria-describedby="open-description"
                          name="open" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="open" class="font-medium text-gray-800 dark:text-white">Open</label>
                        <p id="open-description" class="text-gray-400">Select results with a "Open" Status.</p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="notAfinding" v-model="checkedStatus" value="NotAFinding"
                          aria-describedby="notAfinding-description" name="notAfinding" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notAfinding" class="font-medium text-gray-800 dark:text-white">Not A Finding</label>
                        <p id="notAfinding-description" class="text-gray-400">Select results with a "Not A Finding"
                          Status.
                        </p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="notApplicable" v-model="checkedStatus" value="Not_Applicable"
                          aria-describedby="notApplicable-description" name="notApplicable" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notApplicable" class="font-medium text-gray-800 dark:text-white">Not
                          Applicable</label>
                        <p id="notApplicable-description" class="text-gray-400">Select results with a "Not Applicable"
                          Status.</p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="notReviewed" v-model="checkedStatus" value="Not_Reviewed"
                          aria-describedby="notReviewed-description" name="notReviewed" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="notReviewed" class="font-medium text-gray-800 dark:text-white">Not Reviewed</label>
                        <p id="notReviewed-description" class="text-gray-400">Select results with a "Not Reviewed"
                          Status.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-5 sm:mt-6">
                  <button type="button" :disabled="checkedStatus.length === 0"
                    :class="[checkedStatus.length === 0 ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-500 ', 'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600']"
                    @click="findingsDownload">Download Findings</button>
                </div>
              </div>
              <!-- Checlist Tab -->
              <div v-if="tab3">
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-800 dark:text-white">Checklist
                    Creation
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Future Checklist Settings</p>
                  </div>
                </div>
                <fieldset>
                  <legend class="sr-only">Notifications</legend>
                  <div class="space-y-5">
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="comments" aria-describedby="comments-description" name="comments" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="comments" class="font-medium text-gray-800 dark:text-white">Option 1</label>
                        <p id="comments-description" class="text-gray-300">Explanation for Option 1.</p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="candidates" class="font-medium text-gray-800 dark:text-white">Option 2</label>
                        <p id="candidates-description" class="text-gray-300">Explanation for Option 2.</p>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex h-6 items-center">
                        <input id="offers" aria-describedby="offers-description" name="offers" type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div class="ml-3 text-sm leading-6">
                        <label for="offers" class="font-medium text-gray-800 dark:text-white">Option 3</label>
                        <p id="offers-description" class="text-gray-300">Explanation for Option 3.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-5 sm:mt-6">
                  <button type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="">Download Checklist</button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
  boundaryId: {
    type: Number,
    required: true
  },
  open: {
    type: Boolean,
    required: true
  }
})
const checkedStatus = ref([])
const { boundaryId, open } = props


// const open = ref(true)
// console.log(boundaryId)
// const emits = defineEmits(['showExport']);

const poamDownload = async () => {

  const bodyData = {
    BoundaryId: boundaryId
  }

  await fetch("/api/boundaries/poamDownload",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'POAM.xlsx');

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    })

  // emits('showExport', false);
  // open.value = false;

}

const findingsDownload = async () => {

  const bodyData = {
    BoundaryId: boundaryId,
    filterStatus: checkedStatus.value
  }

  await fetch("/api/boundaries/findingsDownload",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Findings.xlsx');

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    })

  // emits('showExport', false);
  // open.value = false;

}

const tab1 = ref(true)
const tab2 = ref(false)
const tab3 = ref(false)
function tabeLogic(index) {
  if (index === 0) {
    tab2.value = false;
    tab3.value = false;
  }
  else if (index === 1) {
    tab1.value = false;
    tab3.value = false;
  }
  else if (index === 2) {
    tab1.value = false;
    tab2.value = false;
  }
}

const tabs = [
  { name: 'POAM', href: '#', current: tab1 },
  { name: 'Findings', href: '#', current: tab2 },
  { name: 'Checklist', href: '#', current: tab3 },
]
</script>