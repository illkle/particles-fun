import { onBeforeMount, ref, watch } from 'vue'
import { z } from 'zod/v4'

const cursor = {
  totalParticles: 100000,
  uBaseMult: 0.5,
  uBaseTimeScale: 10,
  uBaseDirectionStrength: 0.001,
  uVelPositionScale: 2,
  uVelRandomScale: 0.5,
  uVelTimeScale: 4,
  uVelMult: 0.5,
  uNoiseScale: 0.01,
  uVel2PositionScale: 1,
  uVel2RandomScale: 1,
  uVel2TimeScale: 3,
  uVel2Mult: 2,
  uVel2SizeLowerBound: 1000,
  uVel2SizeUpperBound: 3000,
  uNoise2Scale: 0.01,
  uSizeMod: 2.5,
  uLightPosX: 0,
  uLightPosY: 50,
  uLightPower: 4000,
  uShadowRound: 0.1,
  uShadowDirectional: 0.2,
  lightAtCursor: false,
  emitAtCursor: true,
  emitAtLetter: false,
  emitTowardsCursor: false,
  emitAtX: 0,
  emitAtY: 0,
  emitTowardsX: 0,
  emitTowardsY: 0,
}

const letter = {
  totalParticles: 100000,
  uBaseMult: 0.5,
  uBaseTimeScale: 10,
  uBaseDirectionStrength: 0.001,
  uVelPositionScale: 0.5,
  uVelRandomScale: 0.5,
  uVelTimeScale: 4,
  uVelMult: 1.2,
  uNoiseScale: 0.01,
  uVel2PositionScale: 1,
  uVel2RandomScale: 1,
  uVel2TimeScale: 3,
  uVel2Mult: 0.5,
  uVel2SizeLowerBound: 2000,
  uVel2SizeUpperBound: 3000,
  uNoise2Scale: 0.01,
  uSizeMod: 2.5,
  uLightPosX: -70,
  uLightPosY: 50,
  uLightPower: 1500,
  uShadowRound: 0.15,
  uShadowDirectional: 0.075,
  lightAtCursor: false,
  emitAtCursor: false,
  emitAtLetter: true,
  emitTowardsCursor: false,
  emitAtX: 0,
  emitAtY: 0,
  emitTowardsX: 0,
  emitTowardsY: 0,
}

const turbulent = {
  totalParticles: 50000,
  uBaseMult: 0.5,
  uBaseTimeScale: 10,
  uBaseDirectionStrength: 0.002,
  uVelPositionScale: 1,
  uVelRandomScale: 1,
  uVelTimeScale: 10,
  uVelMult: 2,
  uNoiseScale: 0.01,
  uVel2PositionScale: 1,
  uVel2RandomScale: 1,
  uVel2TimeScale: 10,
  uVel2Mult: 2,
  uVel2SizeLowerBound: 1000,
  uVel2SizeUpperBound: 3000,
  uNoise2Scale: 0.01,
  uSizeMod: 3,
  uLightPosX: -100,
  uLightPosY: 0,
  uLightPower: 5000,
  uShadowRound: 0.05,
  uShadowDirectional: 0.4,
  lightAtCursor: false,
  emitAtCursor: false,
  emitAtLetter: false,
  emitTowardsCursor: true,
  emitAtX: 0,
  emitAtY: 0,
  emitTowardsX: 0,
  emitTowardsY: 0,
}

export const controlsSchema = z.object({
  totalParticles: z.number().int().default(cursor.totalParticles),

  uBaseMult: z.number().default(cursor.uBaseMult),
  uBaseTimeScale: z.number().default(cursor.uBaseTimeScale),

  uBaseDirectionStrength: z.number().default(cursor.uBaseDirectionStrength),

  uVelPositionScale: z.number().default(cursor.uVelPositionScale),
  uVelRandomScale: z.number().default(cursor.uVelRandomScale),
  uVelTimeScale: z.number().default(cursor.uVelTimeScale),
  uVelMult: z.number().default(cursor.uVelMult),

  uNoiseScale: z.number().default(cursor.uNoiseScale),

  uVel2PositionScale: z.number().default(cursor.uVel2PositionScale),
  uVel2RandomScale: z.number().default(cursor.uVel2RandomScale),
  uVel2TimeScale: z.number().default(cursor.uVel2TimeScale),
  uVel2Mult: z.number().default(cursor.uVel2Mult),
  uVel2SizeLowerBound: z.number().int().default(cursor.uVel2SizeLowerBound),
  uVel2SizeUpperBound: z.number().int().default(cursor.uVel2SizeUpperBound),

  uNoise2Scale: z.number().default(cursor.uNoise2Scale),

  uSizeMod: z.number().default(cursor.uSizeMod),
  uLightPosX: z.number().int().default(cursor.uLightPosX),
  uLightPosY: z.number().int().default(cursor.uLightPosY),
  uLightPower: z.number().default(cursor.uLightPower),
  uShadowRound: z.number().default(cursor.uShadowRound),
  uShadowDirectional: z.number().default(cursor.uShadowDirectional),

  lightAtCursor: z.boolean().default(cursor.lightAtCursor),
  emitAtCursor: z.boolean().default(cursor.emitAtCursor),
  emitAtLetter: z.boolean().default(cursor.emitAtLetter),
  emitTowardsCursor: z.boolean().default(cursor.emitTowardsCursor),

  emitAtX: z.number().default(cursor.emitAtX),
  emitAtY: z.number().default(cursor.emitAtX),
  emitTowardsX: z.number().default(cursor.emitTowardsX),
  emitTowardsY: z.number().default(cursor.emitTowardsY),
})

export const defaultControls = controlsSchema.parse({})

export type IContols = z.infer<typeof controlsSchema>

export const presets: Record<string, IContols> = {
  cursor,
  letter,
  turbulent,
}

export const useControls = () => {
  const currentName = ref(localStorage.getItem('currentName') ?? 'cursor')

  const loadDataFromLocal = (v: string) => {
    const ls = localStorage.getItem(v)

    if (ls && ls.length) {
      try {
        const parsed = JSON.parse(ls)

        return { ...controlsSchema.parse(parsed) }
      } catch (e) {}
    }
    return { ...(presets[v] ?? presets.default) }
  }

  const controls = ref(loadDataFromLocal(currentName.value))

  watch(
    controls,
    (v) => {
      localStorage.setItem(currentName.value, JSON.stringify(v))
    },
    { deep: true },
  )

  watch(currentName, (v) => {
    localStorage.setItem('currentName', v)
    controls.value = loadDataFromLocal(v)
  })

  return { controls, currentName }
}
