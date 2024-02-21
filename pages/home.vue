<template>
  <main class="">
    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <!-- Your content -->
      <DashBoardItems />
    </div>
  </main>
</template>

<script setup>
import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();

onMounted(() => {
  store.changeUsername("Welcome to TIR");
});
</script>
