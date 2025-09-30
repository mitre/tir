<template>
  <div
    v-if="banner.initialized && banner.visible"
    :style="{ backgroundColor: banner.color, height: '35px' }"
    class="flex w-full items-center justify-center px-4"
  >
    <span class="truncate text-sm text-white" v-html="banner.html" />
  </div>
</template>

<script setup lang="ts">
import { useBannerStore } from "~/stores/BannerStore";

const banner = useBannerStore();
await banner.load();
</script>
