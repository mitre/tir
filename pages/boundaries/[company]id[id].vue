<script setup>
import { useTestStore } from "~~/stores/HeaderValues";
definePageMeta({
  middleware: ["member-access"],
});
const store = useTestStore();

onMounted(() => {
  store.changeUsername("Boundaries");
});
</script>
<template>
  <main class="">
    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <BoundaryItems />
      <!-- <CompanyList/> -->
    </div>
  </main>
</template>
