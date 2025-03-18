<template>
  <div>
    <div v-if="!isInitialized" class="flex h-screen items-center justify-center">
      <p>Loading application data...</p>
    </div>

    <div v-else>
      <main>
        <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <DashBoardItems />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import NavBar from "~/components/NavBar.vue";
import DashBoardItems from "~/components/DashBoardItems.vue";
import { useAliasStore } from "~~/stores/AliasStorage";
import { useAlertsStore } from "~~/stores/AlertsStore";
import { useTestStore } from "~~/stores/HeaderValues";
import { useRouter } from "vue-router";

const router = useRouter();
const isInitialized = ref(false);

const aliasStore = useAliasStore();
const alertsStore = useAlertsStore();
const testStore = useTestStore();

onMounted(async () => {
  await aliasStore.loadAliases();

  const currentUser = await $fetch("/api/auth/currentUser");
  testStore.changeUsername(currentUser?.email || "Welcome to TIR");

  if (currentUser && currentUser.id) {
    alertsStore.startPolling(currentUser.id);
  } else {
    console.warn("No valid user found; alerts polling not started.");
  }

  isInitialized.value = true;

  router.push("/dashboard");
});
</script>
