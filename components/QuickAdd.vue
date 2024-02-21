<template>
  <TransitionRoot as="template" :show="openMembers">
    <Dialog as="div" class="relative z-10" @close="[$emit('openClose', false), reloadNuxtApp({ ttl: 100 })]">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden max-w-6xl   max-h-fit rounded-lg bg-gray-200 dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6">
              <div class="">

                <div class="sm:flex sm:items-center">
                  <div class="sm:flex-auto">
                    <h1 class="text-lg font-light leading-6 text-gray-800 dark:text-white">
                      Quick Add:
                    </h1>
                  </div>
                  <div class="sm:ml-16 sm:mt-0 sm:flex-none">
                    <button @click="store.addSystem()"
                      class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 ml-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      <PlusIcon class="-ml-0.5 h-5 w-5 bg-indigo-500 rounded-md " aria-hidden="true" />
                      System
                    </button>
                  </div>
                </div>
                <ul role="list" class="divide-y divide-white/5 mt-4 shadow-sm rounded-lg">
                  <li v-for="(system, index) in  store.SystemStigData" :key="system.id"
                    class="hover:bg-gray-400 dark:hover:bg-gray-950 rounded-lg">
                    <Disclosure v-slot="{ open }">
                      <DisclosureButton
                        :class="[open ? 'bg-white dark:bg-gray-950 rounded-t-lg ' : 'bg-gray-100 dark:bg-gray-900 rounded-lg', 'flex w-full items-center h-16 justify-between px-4 py-2 text-left text-md font-medium text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-950 focus:outline-none  focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75']">
                        System {{ index }}
                        <div>
                          <button @click.stop="copySystem(system.Name, SystemStigData[index].TempStigList)" type="button"
                            class="font-semibold mr-4 text-indigo-600 hover:text-indigo-500">Duplicate</button>
                          <button @click.stop="store.deleteSystem(system.id)" type="button"
                            class="font-semibold text-red-600 hover:text-red-500">Remove</button>
                        </div>
                      </DisclosureButton>
                      <DisclosurePanel
                        class="rounded-b-lg flex w-full h-80 bg-gray-100 dark:bg-gray-900 px-4 py-2 text-left text-md font-medium text-gray-800 dark:text-white  focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                        <div class="sm:col-span-2 pr-4">
                          <span for="system"
                            class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">System Name</span>
                          <div class="mt-2">
                            <input v-model="store.SystemStigData[index].Name" type="text" name="system"
                              class="block w-full rounded-md border-0 bg-white dark:bg-white/5 py-1.5 text-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-600 dark:ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                          </div>
                        </div>

                        <div class="sm:col-span-2  w-96">
                          <Combobox v-model="selectedStig" multiple>
                            <ComboboxLabel class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">STIGs
                            </ComboboxLabel>
                            <div class="relative mt-2">
                              <ComboboxInput
                                class="w-full rounded-md border-0 bg-white dark:bg-white/5 py-1.5 pl-3 pr-10 text-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-600 dark:ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                @change="query = $event.target.value" :display-value="(stig) => stig?.title" />
                              <ComboboxButton
                                class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </ComboboxButton>

                              <ComboboxOptions v-if="filteredStigs.length > 0"
                                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white/5 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <ComboboxOption v-for="item in filteredStigs" :key="item.id" :value="item" as="template"
                                  v-slot="{ active, selected }">
                  <li @click="[addTempStig(index, item.id, item.title), query = '']"
                    :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-200']">
                    <span :class="['block', selected && 'font-semibold']">
                      {{ item.title }}
                    </span>

                    <span v-if="selected"
                      :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                  </ComboboxOption>
                  </ComboboxOptions>
              </div>
              </Combobox>
        </div>
        <div class=" sm:col-span-2 ml-6 w-96 ">
          <h1 class="block text-sm text-gray-800 dark:text-white font-medium leading-6">Applied
            STIGs:</h1>
          <!-- Table -->
          <ul role="list"
            class="divide-y divide-white/5 max-h-72  overflow-y-auto scroll-pb-2 scroll-pt-11 overflow-y-auto">
            <li v-for="stig in store.SystemStigData[index].TempStigList" :key="stig.StigId"
              class="relative flex items-center space-x-4 py-2 hover:bg-gray-500/10">
              <div class="flex items-center gap-x-5">
                <button @click="[deleteTempStig(stig.StigId, index)]">
                  <XMarkIcon class="h-6 w-6 text-gray-400 hover:text-white " />
                </button>
                <h2 class="flex min-w-0 text-sm font-normal leading-6 text-gray-800 dark:text-gray-200">
                  <a class="flex gap-x-2 ">
                    <span>{{ stig.name }}</span>
                  </a>
                </h2>
              </div>
            </li>
          </ul>
        </div>

        </DisclosurePanel>
        </Disclosure>
        </li>
        </ul>


      </div>
      <div class="mt-5 text-center">
        <button type="button"
          class="inline-flex w-sm  justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          @click="[$emit('openClose', false), reloadNuxtApp({ ttl: 100 })]">Back to Boundary</button>

        <button type="button"
          class="inline-flex w-sm ml-4 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          @click="[quickAddSystems()]">Create Systems</button>
      </div>
      <TransitionRoot as="template" :show="loading">
        <Dialog as="div" class="relative z-10" @close="loading = false">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
            leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild as="template" enter="ease-out duration-300"
                enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                leave-from="opacity-100 translate-y-0 sm:scale-100"
                leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <DialogPanel
                  class="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                  <div>
                    <div class="flex h-7 items-center">
                      <button type="button"
                        class=" rounded-md bg-gray-900 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        @click="loading = false">
                        <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div class="text-center">
                      <DialogTitle as="h3" class="text-base font-semibold leading-6 text-white">Creating Systems
                      </DialogTitle>
                      <div class="mt-2 mb-12">
                        <p class="text-sm text-white">Please Wait...
                        </p>
                      </div>
                      <div class="absolute -translate-x-1/2 -translate-y-1/2 top-3/4 left-1/2">
                        <svg class="border-gray-300 h-7 w-7 animate-spin rounded-full border-4 border-t-blue-600"
                          viewBox="0 0 24 24">
                        </svg>
                      </div>
                    </div>
                  </div>

                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
      </DialogPanel>
      </TransitionChild>
      </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
  
<script setup>
const props = defineProps({
  openMembers: {
    type: Boolean,
    required: true,
  },
  boundaryId: {
    type: Number,
    required: true
  },
  libraryId: {
    type: Number,
    required: true,
  },
}

);
const { openMembers, boundaryId, libraryId } = props;
import {
  Dialog, DialogPanel, TransitionChild, TransitionRoot, Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'
import { CheckIcon, PlusIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/20/solid'

import { useQuickAddStore } from '~~/stores/QuickAdd'
import { storeToRefs } from "pinia";
const loading = ref(false)
const store = useQuickAddStore()
// const { TempStigList } = store;
const { SystemStigData } = storeToRefs(store);

function addTempStig(index, stigID, stigName) {

  // const sysId = store.SystemStigData.findIndex(o => o.id === systemId)
  // console.log('systemId,stigID,stigName,  sysId', systemId,stigID,stigName )
  if (store.SystemStigData[index].TempStigList.findIndex(o => o.StigId === stigID) === -1) {
    store.addTempStigList(index, stigID, stigName)
  }
}
function deleteTempStig(StigId, index) {
  store.deleteTempStigList(StigId, index)
}
function removeSystem(systemId) {
  store.deleteSystem(systemId)
}
/////List Logic

const stigs = {
  "StigLibraryId": libraryId,

}

const { data: stigList } = await useFetch("/api/stig/library/list", {
  method: 'POST',
  body: stigs
}
);
const query = ref('')
const selectedStig = ref([])

const filteredStigs = computed(() =>
  query.value === ''
    ? stigList.value
    : stigList.value.filter((item) => {
      return item.title.toLowerCase().includes(query.value.toLowerCase())
    }),

)
const emit = defineEmits(['openClose'])
/// ///// Create Systems 
async function quickAddSystems() {
  loading.value = true;
  for (let i = 0; i < store.SystemStigData.length; i++) {
    try {
      await useFetch("/api/systems/create", {
        method: 'POST',
        body: { "name": store.SystemStigData[i].Name, "BoundaryId": boundaryId }
      });
    }
    finally {
      const systemId = await getSystemId(store.SystemStigData[i].Name)
      try {
        for (let index = 0; index < store.SystemStigData[i].TempStigList.length; index++) {
          await useFetch("/api/systems/stig/add", {
            method: 'POST',
            body: { "StigId": store.SystemStigData[i].TempStigList[index].StigId, "SystemId": systemId }
          });
        }
      }
      catch {
        console.log('ERROR')
      };

    }

  }
  loading.value = false;
  emit('openClose', false)
}
async function getSystemId(systemName) {
  const { data: SystemList } = await useFetch("/api/systems/list", {
    key: 'list',
    method: 'POST',
    body: { "boundary": boundaryId }
  });
  const systemId = SystemList.value[SystemList.value.findIndex(o => o.name === systemName)].id
  return (systemId)
}

function copySystem(name, list) {
  const test = list
  store.addSystemCopy(name, test)
  const copyIndex = store.SystemStigData.findIndex(o => o.Name === (name + '(Copy)'))
  for (let i = 0; i < test.length; i++) {
    store.addTempStigList(copyIndex, test[i].StigId, test[i].name)
  }


}

</script>