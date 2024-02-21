<template>
  <div class="mx-auto max-w-7xl">
    <div class="bg-gray-700/10">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-8 flow-root">
          <div class="-mx-4 sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 dark:text-white sm:pl-0"
                    >
                      System Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      STIGs Applied
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Finding Status
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-400 dark:divide-gray-800">
                  <tr
                    v-for="system in store.Summary.systemView"
                    :key="system.id"
                    class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-950 sm:rounded-lg"
                    @click="
                      [
                        (StigLibraryId = Summary.boundaryInfo.StigLibraryId),
                        router.push(
                          '/boundaries/' +
                            route.params.boundary +
                            'id' +
                            route.params.id +
                            '/SystemView/' +
                            route.params.details +
                            '-' +
                            system.name,
                        ),
                      ]
                    "
                  >
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 dark:text-white sm:pl-0"
                    >
                      {{ system.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {{ system.stigsApplied.length }}
                    </td>
                    <td class="flex whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-300">
                      <div class="flex">
                        <p class="text-green-500">{{ system.findings.NotAFinding }}</p>
                        /
                        <p class="text-red-600">{{ system.findings.Open }}</p>
                        /
                        <p class="text-sky-500">{{ system.findings.Not_Applicable }}</p>
                        /
                        <p class="text-amber-500">{{ system.findings.Not_Reviewed }}</p>
                      </div>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium">
                      <Menu as="div" class="relative">
                        <MenuButton
                          class="z-10 -m-2.5 block p-2.5 text-right text-gray-800 hover:text-gray-500 dark:text-gray-100"
                          @click.stop=""
                        >
                          <span class="sr-only">Open options</span>
                          <EllipsisVerticalIcon class="h-6 w-6" aria-hidden="true" />
                        </MenuButton>
                        <transition
                          enter-active-class="transition ease-out duration-100"
                          enter-from-class="transform opacity-0 scale-95"
                          enter-to-class="transform opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-75"
                          leave-from-class="transform opacity-100 scale-100"
                          leave-to-class="transform opacity-0 scale-95"
                        >
                          <MenuItems
                            class="absolute right-0 z-50 mt-0.5 w-32 origin-top-right cursor-pointer divide-y divide-white/20 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-800"
                          >
                            <MenuItem v-slot="{ active }">
                              <a
                                :class="[
                                  active
                                    ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300',
                                  'group flex items-center px-3 py-1 text-sm leading-6 text-gray-100',
                                ]"
                                @click.stop="[deleteSystem(system.id)]"
                              >
                                <TrashIcon
                                  class="mr-3 h-5 w-5 text-gray-600 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-white"
                                  aria-hidden="true"
                                />
                                Delete
                              </a>
                            </MenuItem>
                          </MenuItems>
                        </transition>
                      </Menu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { useIdStorageStore } from "~~/stores/IdStorage";

const router = useRouter();
const route = useRoute();

const store = useIdStorageStore();
const { BoundaryId } = storeToRefs(store);
const { StigLibraryId } = storeToRefs(store);
const { Summary } = storeToRefs(store);
async function refreshSummary() {
  const { data: summary } = await useLazyFetch("/api/boundaries/summary", {
    server: false,
    method: "GET",
    query: { BoundaryId: BoundaryId.value },
  });

  store.Summary = summary;
}

async function deleteSystem(id) {
  try {
    await useFetch("/api/systems/delete", {
      method: "POST",
      body: { SystemId: id },
    });
  } finally {
    refreshSummary();
    location.reload();
  }
}
</script>
