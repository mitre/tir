<script setup>

import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();

onBeforeMount(() => {
  store.changeUsername('Administration')
})
</script>
<template>
  
      <main class="">
        <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <!-- <Admin Items/> -->
          <UserAdmin />
        </div>
      </main>

  </template>

  
  
