<template>
  <Popover v-slot="{ open }" class="relative">
    <PopoverButton
      :class="open ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white/90'"
      class="group inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-base font-medium hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 dark:bg-gray-800 dark:hover:text-white"
    >
      <span>Filters</span>
      <ChevronDownIcon
        :class="open ? 'text-black dark:text-gray-300' : 'text-gray-800 dark:text-gray-300/70'"
        class="ml-2 h-5 w-5 transition duration-150 ease-in-out dark:group-hover:text-gray-300/80"
        aria-hidden="true"
      />
    </PopoverButton>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel class="absolute z-10 mt-1 w-44 transform px-4 sm:px-0">
        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
          <div class="relative bg-white p-4 dark:bg-gray-700">
            <!-- Select All -->
            <div class="mr-4 flex items-center">
              <input
                id="select-all-checkbox"
                type="checkbox"
                :checked="selectAll"
                class="ring-offet-gray-600 h-4 w-4 rounded border-gray-400 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                @click.stop="toggleSelectAll"
              />
              <label for="select-all-checkbox" class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                >Select All</label
              >
            </div>
            <!-- Dynamic Status List -->
            <div v-for="(value, key) in filters" :key="key" class="mr-4 mt-2 flex items-center">
              <input
                :id="`checkbox-${key}`"
                type="checkbox"
                :checked="value"
                class="h-4 w-4 rounded border-gray-400 bg-white text-indigo-600 ring-offset-gray-800 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700"
                @click="toggleFilter(key)"
              />
              <label :for="`checkbox-${key}`" class="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300">{{
                key
              }}</label>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverPanel, PopoverButton } from "@headless/vue";

const model = defineModel();
</script>
