<template>
  <div class="flex items-center gap-2 py-5">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      :disabled="props.disabled"
      class="border-neutral-800 border px-1 rounded"
    />
    <label :for="id" class="text-xs" v-if="props.label">{{ props.label }}</label>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const id = useId()
const model = defineModel<boolean>()

const props = defineProps<{ label?: string; disabled?: boolean }>()
</script>
