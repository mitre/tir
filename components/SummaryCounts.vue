<template>
  <div>
    <!-- Hover Display -->
    {{ title }}
    <div v-if="hoverText" :class="hoverClass">
      {{ hoverText }}
    </div>
    <!-- Stats Display -->
    <div class="flex flex-col gap-y-0">
      <!-- Total Stats -->
      <div class="flex items-baseline">
        <p class="ml-4 mr-6 text-sm text-gray-600 dark:text-gray-400">Total:</p>
        <div class="mt-2 flex text-xl font-normal tracking-tight text-gray-600 dark:text-white">
          <span
            v-for="(item, index) in items"
            :key="index"
            class="flex items-center"
            @mouseover="updateHover(item.text, item.color)"
            @mouseleave="clearHover"
          >
            <span :class="`text-${item.color}-500 hover:text-${item.color}-700`">
              {{ stats1[item.name] }}
            </span>
            <span v-if="index < items.length - 1" class="text-gray-900 dark:text-gray-400">/</span>
          </span>
        </div>
      </div>

      <!-- Unique Stats -->
      <div class="flex items-baseline">
        <p class="ml-4 mr-4 text-sm text-gray-600 dark:text-gray-400">Unique:</p>
        <div class="mt-2 flex text-xl font-normal tracking-tight text-gray-600 dark:text-white">
          <span
            v-for="(item, index) in items"
            :key="index"
            class="flex items-center"
            @mouseover="updateHover(item.text, item.color)"
            @mouseleave="clearHover"
          >
            <!-- <span :class="`text-${item.color}-500`"> -->

            <span :class="textColorClass(item.color)">
              {{ stats2[item.name] }}
            </span>
            <span v-if="index < items.length - 1" class="text-gray-900 dark:text-gray-400">/</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

defineProps({
  title: { type: String, default: "" },
  items: { type: Array, default: () => [{ name: "", text: "", color: "" }] },
  stats1: { type: Object, default: () => {} },
  stats2: { type: Object, default: () => {} },
});

const hoverText = ref("");
const hoverColor = ref("");

const hoverClass = computed(() => {
  const baseClasses = "inline-flex items-center rounded-md px-2 text-xs font-medium";

  const colorClasses = {
    red: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
    green: "bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
    sky: "bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20",
    orange: "bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20",
  };

  return `${baseClasses} ${colorClasses[hoverColor.value] || ""}`;
});

const textColorClass = (color) => {
  const textColors = {
    red: "text-red-500",
    green: "text-green-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    sky: "text-sky-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
  };

  return textColors[color] || "text-gray-800 dark:text-gray-300";
};

function updateHover(text, color) {
  hoverText.value = text;
  hoverColor.value = color;
}

function clearHover() {
  hoverText.value = "";
  hoverColor.value = "";
}
</script>
