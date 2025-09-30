<template>
  <ColorScheme placeholder="..." tag="span">
    <footer class="fixed bottom-0 -z-10 w-full bg-gray-100 dark:bg-gray-900">
      <div class="max-w-7xl px-6 py-1 md:flex md:items-center md:justify-between lg:px-8">
        <div style="height: 80px" class="mt-8 md:order-1 md:mt-0">
          <div class="flex-shrink-0">
            <img class="h-8 w-full" :src="imageUrl" alt="logo" />
          </div>
          <div class="leading-5">
            <p class="text-left text-xs font-thin leading-10 text-gray-500 dark:text-white">
              Built in collaboration with Lockheed Martin.
            </p>
          </div>

          <div>
            <br />
          </div>
        </div>
      </div>
    </footer>
  </ColorScheme>
</template>
<script setup>
import lightModeImageUrl from "../../assets/LM-logo_blue_SVG.svg?url";
import darkModeImageUrl from "../../assets/LM-logo_white_SVG.svg?url";

const colorMode = useColorMode();

const imageUrl = imageSelection(() => {
  return colorMode.value === "dark" ? darkModeImageUrl : lightModeImageUrl;
});

useHead({
  link: [{ rel: "preload", as: "image", href: imageUrl.value }],
});
</script>
