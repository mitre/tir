<template>
  <ColorScheme placeholder="..." tag="span">
    <!-- class="flex h-16 items-center justify-between px-4 sm:px-0" -->
    <footer class="bg-gray fixed bottom-0 ml-7 dark:bg-gray-900">
      <div class="max-w-7xl px-6 py-1 lg:px-8">
        <div style="height: 120px" class="mt-8 md:order-1 md:mt-0">
          <div v-if="colorMode.value === 'light'" class="flex-shrink-0">
            <img class="h-10 w-full" src="../assets/LM-logo_blue_SVG.svg" alt="white" />
          </div>
          <div v-else-if="colorMode.value === 'dark'" class="flex-shrink-0">
            <img class="h-10 w-full" src="../assets/LM-logo_white_SVG.svg" alt="Your blue" />
          </div>
          <div class="leading-5">
            <p class="text-center text-xs leading-10 text-gray-500 dark:text-white">
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
const colorMode = useColorMode();
</script>
