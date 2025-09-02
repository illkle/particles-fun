<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs" v-if="props.label">{{ props.label }}</label>
    <input v-model.number="model" :disabled="props.disabled" class="border-neutral-800 border px-1 rounded disabled:opacity-20" />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<number>()

const props = defineProps<{ label?: string; disabled?: boolean }>()
</script>
