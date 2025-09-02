<template>
  <div
    class="absolute opacity-[95%] max-w-[600px] w-screen h-screen bg-neutral-900 transition-opacity rounded-tl-xl bottom-0 right-0 z-100 flex flex-col"
    v-if="controls"
    :class="{
      'translate-x-[100%]': !opened,
    }"
  >
    <div
      class="absolute bg-neutral-900 left-6 px-2 top-1/2 pb-2 text-center -rotate-90 -translate-full cursor-pointer"
      @click="() => (opened = !opened)"
    >
      Controls
    </div>

    <div class="overflow-y-scroll p-4 flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h4>Presets</h4>
        <div class="flex gap-2">
          <div
            class="border px-2 rounded data-[active=true]:bg-neutral-50 data-[active=true]:text-neutral-950"
            :data-active="currentName === k"
            v-for="(_, k) in presets"
            @click="() => (currentName = k)"
          >
            {{ k }}
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <button class="border p-1" @click="copy">Copy Settings JSON</button>
        <button class="border p-1" @click="paste">Parse Settings JSON</button>
      </div>

      <div class="mt-4">
        <h4>Global</h4>
        <p class="text-xs mb-1 opacity-50">Refresh page for total particles to take effect</p>
        <div class="grid grid-cols-4 gap-x-2 gap-y-1">
          <NumberInput v-model="controls.totalParticles" label="Total particles" />
          <NumberInput v-model="controls.uSizeMod" label="Size modifier" />
        </div>
      </div>

      <div>
        <h4>Emitter</h4>
        <div class="grid grid-cols-4 gap-x-2 gap-y-1">
          <NumberInput v-model="controls.emitAtX" :disabled="controls.emitAtCursor" label="Emitter X" />
          <NumberInput v-model="controls.emitAtY" :disabled="controls.emitAtCursor" label="Emitter Y" />

          <NumberInput v-model="controls.emitTowardsX" :disabled="controls.emitAtCursor" label="Emit towards X" />
          <NumberInput v-model="controls.emitTowardsY" :disabled="controls.emitAtCursor" label="Emit towards Y" />

          <NumberInput v-model="controls.uBaseDirectionStrength" label="Emit towards strength " />
          <Checkbox v-model="controls.emitAtCursor" label="Emit from cursor" />
          <Checkbox v-model="controls.emitAtLetter" label="Emit from letter" />
          <Checkbox v-model="controls.emitTowardsCursor" label="Emit towards cursor" />
        </div>
      </div>
      <div>
        <h4>Primary Noise</h4>
        <p class="text-xs mb-1 opacity-50">Primary noise that controls particle velocity</p>
        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
          <NumberInput v-model="controls.uVelPositionScale" label="Variance over particle position" />
          <NumberInput v-model="controls.uVelRandomScale" label="Random variance" />
          <NumberInput v-model="controls.uVelTimeScale" label="Variance over time" />
          <NumberInput v-model="controls.uVelMult" label="Velocity Multiplier" />

          <NumberInput v-model="controls.uNoiseScale" label="Noise Scale" />
        </div>
      </div>

      <div>
        <h4>Secondary Noise</h4>
        <p class="text-xs mb-1 opacity-50">Second noise for particle velocity, that only applies to smaller particles</p>
        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
          <NumberInput v-model="controls.uVel2PositionScale" label="Variance over particle position" />
          <NumberInput v-model="controls.uVel2RandomScale" label="Random variance" />
          <NumberInput v-model="controls.uVel2TimeScale" label="Variance over time" />
          <NumberInput v-model="controls.uVel2Mult" label="Velocity Multiplier" />
          <NumberInput v-model="controls.uNoise2Scale" label="Noise Scale" />

          <NumberInput v-model="controls.uVel2SizeLowerBound" label="Start decreasing at size" />
          <NumberInput v-model="controls.uVel2SizeUpperBound" label="Decrease to zero at size" />
        </div>
      </div>

      <div>
        <h4>Light</h4>
        <p class="text-xs mb-1 opacity-50">Simulates light falloff. Zero coordinate is center of the screen</p>
        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
          <NumberInput v-model="controls.uLightPosX" :disabled="controls.lightAtCursor" label="Position X" />
          <NumberInput v-model="controls.uLightPosY" :disabled="controls.lightAtCursor" label="Position Y" />

          <NumberInput v-model="controls.uLightPower" label="Power" />
          <Checkbox v-model="controls.lightAtCursor" label="Light at cursor" />
        </div>
      </div>
      <div class="mt-2">
        <h4>Shadows</h4>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1">
          <label class="text-xs">Shadow Base</label>
          <label class="text-xs">Shadow From Light</label>
          <NumberInput v-model="controls.uShadowRound" />
          <NumberInput v-model="controls.uShadowDirectional" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NumberInput from './inputs/NumberInput.vue'
import { controlsSchema, defaultControls, presets, type IContols } from './controls'
import Checkbox from './inputs/Checkbox.vue'
import { ref } from 'vue'

const opened = ref(false)

const controls = defineModel<IContols>()

const currentName = defineModel<string>('name')

const copy = async () => {
  await navigator.clipboard.writeText(JSON.stringify(controls.value))
}

const paste = async () => {
  const clipboardContents = await navigator.clipboard.read()
  console.log(clipboardContents)
  const i = clipboardContents[0]
  const blob = await i.getType('text/plain')
  const blobText = await blob.text()

  controls.value = controlsSchema.parse(JSON.parse(blobText))
}
</script>
