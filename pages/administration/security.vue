<template>
  <dl class="mb-6 space-y-6 divide-y divide-gray-100 border-b border-t border-gray-200 pb-6 pt-6 text-sm leading-6">
    <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
      <!-- Site Banner -->
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Site Banner</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configuration for the optional banner at the top of the site.
        </p>
      </div>

      <!-- Site Banner Config -->
      <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <!-- Site Banner Label and Desc -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="siteBannerVisible" class="ml-auto" />
        </div>
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Banner Color</label>
          <div class="ml-auto flex items-center gap-2">
            <span>{{ siteBannerColor }}</span>
            <input v-model="siteBannerColor" type="color" class="h-8 w-16 rounded border" />
          </div>
        </div>

        <!-- Site Banner Text -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Banner Text</label>
          <textarea
            v-model="siteBannerHtml"
            rows="2"
            class="flex-1 rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          ></textarea>
        </div>

        <!-- Site Banner: Preview -->
        <div class="flex w-full items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Preview</label>

          <div
            v-if="siteBannerVisible"
            class="ml-auto flex h-[35px] max-w-xs flex-1 items-center overflow-hidden rounded px-2"
            :style="{ backgroundColor: siteBannerColor }"
          >
            <div class="justify-center truncate text-sm text-white" style="width: 100%" v-html="siteBannerHtml"></div>
          </div>
        </div>
      </div>

      <!-- Site Banner: Save button -->
      <div class="flex w-24 items-start items-center justify-center">
        <button
          type="button"
          class="text-sm font-semibold text-indigo-600 hover:bg-indigo-500"
          @click="saveSiteBannerConfig"
        >
          Save
        </button>
      </div>
    </dd>
    <dd class="mt-1 flex justify-between gap-x-6 pt-6 sm:mt-0 sm:flex-auto">
      <!-- Login Banner: label and description -->
      <div class="text-gray-800 dark:text-white sm:w-48 sm:flex-none sm:pr-6">
        <div class="text-lg font-medium">Login Banner</div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Configuration for the optional banner at login.</p>
      </div>

      <div class="flex-1 space-y-4 text-gray-800 dark:text-white">
        <!-- Login Banner Enable-->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Enabled</label>
          <UISlideSwitch v-model="loginBannerEnable" class="ml-auto" />
        </div>
        <!-- Login Banner Title -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Banner Title</label>
          <textarea
            v-model="loginBannerTitle"
            rows="1"
            class="flex-1 rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          ></textarea>
        </div>

        <!-- Login Banner Text -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Banner Text</label>
          <textarea
            v-model="loginBannerHtml"
            rows="3"
            class="flex-1 rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          ></textarea>
        </div>
        <!-- Login Banner Mode -->
        <div class="flex items-center gap-4">
          <label class="w-24 text-left text-sm font-medium">Banner Mode</label>
          <select
            v-model="loginBannerMode"
            class="flex-1 rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          >
            <option :value="'checkbox'">Checkbox</option>
            <option :value="'modal'">Popup Window</option>
          </select>
        </div>
      </div>
      <!-- Login Banner: Save -->
      <div class="flex w-24 items-start items-center justify-center">
        <button
          type="button"
          class="text-sm font-semibold text-indigo-600 hover:bg-indigo-500"
          @click="() => saveLoginBannerConfig(loginBannerEnable, loginBannerMode, loginBannerHtml, loginBannerTitle)"
        >
          Save
        </button>
      </div>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { loadLoginBannerConfig, saveLoginBannerConfig } from "~/utils/loginBanner";

const bannerStore = useBannerStore();
const siteBannerVisible = ref(true);
const siteBannerHtml = ref("");
const siteBannerColor = ref("#1F5BA6");

const loginBannerEnable = ref(false);
const loginBannerMode = ref<"modal" | "checkbox">("modal");
const loginBannerHtml = ref("");
const loginBannerTitle = ref("");

definePageMeta({
  layout: "admin",
});

onMounted(async () => {
  await bannerStore.load();
  siteBannerVisible.value = bannerStore.visible;
  siteBannerHtml.value = bannerStore.html;
  siteBannerColor.value = bannerStore.color;
  await loadLoginBannerConfig(loginBannerEnable, loginBannerMode, loginBannerHtml, loginBannerTitle);
});

const saveSiteBannerConfig = async () => {
  await bannerStore.save({
    visible: siteBannerVisible.value,
    html: siteBannerHtml.value,
    color: siteBannerColor.value,
  });
};
</script>
