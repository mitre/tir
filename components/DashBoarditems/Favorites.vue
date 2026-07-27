<template>
  <div class="max-h-96 w-full overflow-y-auto rounded-md">
    <ul role="list" class="divide-y divide-gray-300 dark:divide-gray-700">
      <li
        v-for="favorite in favorites"
        :key="`${favorite.type}-${favorite.id}`"
        class="flex cursor-pointer items-center justify-between gap-x-4 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="openFavorite(favorite)"
      >
        <div class="flex min-w-0 items-center gap-x-3">
          <div>
            <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {{ favorite.name }}
            </p>

            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ favorite.type }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="shrink-0 rounded p-1 text-yellow-400 hover:text-yellow-500"
          @click.stop="removeFavorite(favorite)"
        >
          <StarIcon class="h-5 w-5 fill-current" />
        </button>
      </li>

      <li v-if="favorites.length === 0" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No favorites yet.
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { StarIcon } from "@heroicons/vue/24/solid";
import { useAliasStore } from "~/stores/AliasStorage";
const aliasStore = useAliasStore();
const { data: config, error } = await useFetch("/api/favorites/list");
const boundaryTerm = aliasStore.BoundaryAlias;
const companyTerm = aliasStore.CompanyAlias;

const favorites = ref([]);

if (config.value) {
  favorites.value = [
    ...(config.value.FavoriteTiers || []).map((tier) => ({
      id: tier.id,
      name: tier.name,
      type: "Company",
      parentId: tier.parentId,
    })),
    ...(config.value.FavoriteBoundaries || []).map((boundary) => ({
      id: boundary.id,
      name: boundary.name,
      type: "Boundary",
      TierId: boundary.TierId,
    })),
  ];
} else if (error.value) {
  console.error("Failed to load user config:", error.value);
}

const removeFavorite = async (favorite) => {
  if (favorite.type === "Company") {
    await $fetch(`/api/favorites/tiers/${favorite.id}`, {
      method: "DELETE",
    });
  } else {
    await $fetch(`/api/favorites/boundaries/${favorite.id}`, {
      method: "DELETE",
    });
  }

  favorites.value = favorites.value.filter((f) => !(f.id === favorite.id && f.type === favorite.type));
};

const openFavorite = async (favorite) => {
  if (favorite.type === "Company") {
    await navigateTo({
      path: "/company-boundary",
      query: {
        favoriteTierId: favorite.id,
      },
    });

  } else {
    try {
      await $fetch("/api/boundaries/summary", {
        method: "GET",
        query: { BoundaryId: favorite.id, authOnly: true },
      });

      await navigateTo({
        path: "/company-boundary/" + favorite.id,
      });
    } catch (error) {
      errorObject.value = error;
      showErrorNotification.value = true;
      setTimeout(() => (showErrorNotification.value = false), 6000);
    }
  }
};
</script>
