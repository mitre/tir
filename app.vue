<script setup>
useHead({
  link: [
    // { rel:'stylesheet', href:'https://rsms.me/inter/inter.css'}
  ],
  htmlAttrs: {
    class: "h-full ",
  },
  bodyAttrs: {
    class: "h-full dark:bg-gray-900 bg-gray-100",
  },
});
</script>
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
