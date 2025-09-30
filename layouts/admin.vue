<template>
  <div id="admin-layout" class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <NavBar />

    <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="flex px-6 pt-4 lg:gap-x-16">
          <aside
            class="ml-10 flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20"
          >
            <AdminSidebar />
          </aside>

          <main class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import AdminSidebar from "~/components/AdminSidebar.vue";
</script>
