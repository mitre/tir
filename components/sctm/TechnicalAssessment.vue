<template>
  <div class="relative inline-block">
    <h1 class="mb-2 cursor-help text-black underline dark:text-white">Technical Assessment Status</h1>
  </div>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-8">
      <div class="">
        <text class="font-light text-black dark:text-gray-200"> {{ item.technicalAssessmentStatus }} </text>
      </div>
    </div>
  </div>
  <div class="relative mt-4 inline-block">
    <h1 class="cursor-help text-black underline dark:text-white">Technical Assessment Comments</h1>
  </div>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-8">
      <div class="whitespace-pre-wrap">
        <div
          v-for="(line, index) in item.technicalAssessmentComments"
          :key="index"
          :class="{
            'pt-2 text-red-500': line.trim() === 'Open',
            'pt-2 text-green-500': line.trim() === 'NotAFinding',
            'pt-2 text-sky-500': line.trim() === 'Not_Applicable',
            'pt-2 text-amber-500': line.trim() === 'Not_Reviewed',
            'font-light text-black dark:text-gray-200': ![
              'Open',
              'NotAFinding',
              'Not_Applicable',
              'Not_Reviewed',
            ].includes(line.trim()),
          }"
          class="block"
        >
          {{ line }}
        </div>
      </div>
    </div>
  </div>
  <div class="relative mt-4 inline-block">
    <h1 class="mb-2 cursor-help text-black underline dark:text-white">CCI</h1>
  </div>
  <div class="grid grid-cols-8 gap-x-6 gap-y-8">
    <div class="col-span-8">
      <div class=" whitespace-pre-wrap">
        <text class="font-light text-black dark:text-gray-200">
          {{ item.cci }}
        </text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DropdownItem {
  id: number;
  name: string;
}

const props = defineProps({
  evaluationItem: { type: Object, required: true },
  complianceStatus: { type: Array as PropType<DropdownItem[]>, required: true },
});

const item = toRef(props, "evaluationItem");
</script>