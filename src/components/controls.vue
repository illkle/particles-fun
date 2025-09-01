<template>
  <div
    class="absolute opacity-70 w-[600px] h-screen overflow-y-scroll bg-neutral-900 transition-opacity p-4 rounded-tl-xl bottom-0 right-0 z-100 flex flex-col gap-4"
    v-if="controls"
  >
    <button @click="controls = defaultControls">Reset</button>

    <div>
      <h4>Emitter</h4>
      <div class="grid grid-cols-4 gap-x-2 gap-y-1">
        <NumberInput v-model="controls.emitAtX" :disabled="controls.emitAtCursor" label="Emitter X" />
        <NumberInput v-model="controls.emitAtY" :disabled="controls.emitAtCursor" label="Emitter Y" />

        <NumberInput v-model="controls.uSizeMod" label="Size Modifier" />
        <NumberInput v-model="controls.emitTowardsX" :disabled="controls.emitAtCursor" label="Emit towards X" />
        <NumberInput v-model="controls.emitTowardsY" :disabled="controls.emitAtCursor" label="Emit towards Y" />
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
      <p class="text-xs mb-1 opacity-50">Second noise for particle velocity, that only applies to particles in certain size range</p>
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
        <NumberInput v-model="controls.uLightPosX" label="Position X" />
        <NumberInput v-model="controls.uLightPosY" label="Position Y" />
        <NumberInput v-model="controls.uLightPower" label="Power" />
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
</template>

<script lang="ts" setup>
import NumberInput from './inputs/NumberInput.vue'
import { defaultControls, type IContols } from './controls'
import Checkbox from './inputs/Checkbox.vue'

const controls = defineModel<IContols>()
</script>
