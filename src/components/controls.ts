export const defaultControls = {
  totalParticles: 50000,

  uBaseMult: 0.5,
  uBaseTimeScale: 10,

  uBaseDirectionStrength: 0.01,

  uVelPositionScale: 0.2,
  uVelRandomScale: 0.1,
  uVelTimeScale: 1,
  uVelMult: 2,

  uNoiseScale: 0.1,

  uVel2PositionScale: 0.2,
  uVel2RandomScale: 0.1,
  uVel2TimeScale: 1.3,
  uVel2Mult: 2,
  uVel2SizeLowerBound: 3000,
  uVel2SizeUpperBound: 4000,

  uNoise2Scale: 0.3,

  uSizeMod: 3,
  uLightPosX: -50,
  uLightPosY: 100,
  uLightPower: 1500,
  uShadowRound: 0.1,
  uShadowDirectional: 0.3,

  lightAtCursor: false,
  emitAtCursor: false,
  emitAtLetter: false,
  emitTowardsCursor: false,

  emitAtX: 0,
  emitAtY: 0,
  emitTowardsX: 0,
  emitTowardsY: 0,
}

export type IContols = typeof defaultControls
