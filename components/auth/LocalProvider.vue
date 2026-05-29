<template>
  <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
    <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
      <div class="text-lg font-medium">Local Auth</div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Built-in username/password authentication.</p>
    </div>
    <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
      <div class="flex items-center gap-4">
        <label class="w-24 text-left text-sm font-medium">Enabled</label>
        <UISlideSwitch
          v-model="local.enable"
          class="ml-auto"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Min Length</label>
        <AppInput
          v-model.number="local.passwordLength"
          type="number"
          min="1"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Uppercase Letters</label>
        <AppInput
          v-model.number="local.upperCount"
          type="number"
          min="0"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Lowercase Letters</label>
        <AppInput
          v-model.number="local.lowerCount"
          type="number"
          min="0"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Numbers</label>
        <AppInput
          v-model.number="local.numberCount"
          type="number"
          min="0"
          class="flex-1"
        />
      </div>
      <div class="flex items-center gap-4">
        <label class="w-48 text-left text-sm font-medium">Special Characters</label>
        <AppInput
          v-model.number="local.specialCount"
          type="number"
          min="0"
          class="flex-1"
        />
      </div>
    </div>
  </dd>
</template>

<script setup lang="ts">
import type { LocalAuthConfig } from "~/types/auth";

const local = defineModel<LocalAuthConfig>("local", { required: true });
</script>
