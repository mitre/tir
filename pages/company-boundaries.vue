<script setup>
import { useTestStore } from "~~/stores/HeaderValues";
const store = useTestStore();
//for the term alias
const { data: currentAlias } = await useFetch("/api/boundaries/alias");
//renders the current alias
const tierView = ref(currentAlias.value[0]);
const boundaryView = ref(currentAlias.value[1]);

onMounted(() => {
  store.changeUsername(boundaryView.value.alias);
});
</script>
<template>
  <main class="">
    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <!-- <BoundaryItems/> -->
      <CompanyList />
    </div>
  </main>
</template>
