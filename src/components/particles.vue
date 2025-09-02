<template>
  <div ref="letterWrapper" class="absolute top-1/2 -translate-y-1/2 left-1/2 opacity-100 -translate-x-1/2">
    <svg class="w-[300px]" viewBox="0 0 101 109" fill="none" stroke="white" stroke-width="0.1" xmlns="http://www.w3.org/2000/svg">
      <path
        ref="letterRef"
        d="M0.782227 107V0.5H30.1822V42.65L62.7322 0.5H96.0322L58.6822 48.05L98.1322 107H65.5822L39.4822 67.1L30.1822 78.5V107H0.782227Z"
      />
    </svg>

    <div
      class="absolute top-0 left-0 w-2 rounded-2xl h-2 opacity-0 bg-red-500"
      :style="`transform: translate(${onLetterPosition.translateX}px, ${onLetterPosition.translateY}px)`"
    ></div>
  </div>
  <Controls v-model="controls" />
  <div ref="canvasP" class="absolute top-0 overflow-hidden opacity-100"></div>
</template>

<script setup lang="ts">
import Controls from './controls.vue'
import FragInfo from './sim_fragInfo.glsl'
import FragPosition from './sim_fragPosition.glsl'
import FragVelocity from './sim_fragVelocity.glsl'
import FragRandom from './sim_fragRandom.glsl'
import * as THREE from 'three'
import FragmentShader from './part_fragmentShader.glsl'
import VertexShader from './part_vertexShader.glsl'
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js'
import { useElementBounding, useLocalStorage, useWindowSize } from '@vueuse/core'
import { ref, computed, onMounted, watchEffect } from 'vue'
import { AttributeGenerator } from '@/utils/attributeGenerator'
import { easeInExpo, fillTexture } from '@/utils/helpers'
import { customRandomness2 } from '@/utils/random'
import { range } from '@/utils/helpers'
import { defaultControls } from './controls'
import { animate, svg } from 'animejs'

const controls = useLocalStorage('particleFunSettings', defaultControls)

const { width, height } = useWindowSize()

const canvasP = ref<HTMLDivElement | null>(null)

let renderer = new THREE.WebGLRenderer({ alpha: true })
let scene = new THREE.Scene()
let camera: THREE.PerspectiveCamera | null

const letterWrapper = ref<HTMLDivElement | null>(null)

const letterWrapperDims = useElementBounding(letterWrapper)

const letterRef = ref<HTMLDivElement | null>(null)

const onLetterPosition = ref({ translateX: 0, translateY: 0, rotate: 0, percentage: 0, pathLen: 0 })

onMounted(() => {
  if (!letterRef.value) return

  animate(onLetterPosition.value, {
    duration: 2000,
    loop: true,
    playbackEase: 'linear',
    ...svg.createMotionPath(letterRef.value),
  })
})

const initSim = () => {
  if (!canvasP.value) return
  camera = new THREE.PerspectiveCamera(75, document.documentElement.clientWidth / document.documentElement.clientHeight, 0.1, 1000)

  renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  canvasP.value.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    if (!camera) return
    renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
    camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight
    camera.updateProjectionMatrix()
  })

  camera.position.z = 100

  const particlesGeo = new THREE.BufferGeometry()

  const count = Math.round(controls.value.totalParticles)

  const texSize = Math.ceil(Math.sqrt(count))

  const gpuCompute = new GPUComputationRenderer(texSize, texSize, renderer)

  // To simulate particles on a gpu data is stored in textures.
  // Each texture is vec4 with the folowing vals
  // dtRandom — random static seed for each particle random generation x3, particle size
  // dtVelocity — xyz velocities
  // dtInfo  — timeBorn, timeDead, isFreshSpawn
  // dtPositon — xyz position, blank

  const dtRandom = gpuCompute.createTexture()
  const dtPosition = gpuCompute.createTexture()
  const dtVelocity = gpuCompute.createTexture()
  const dtInfo = gpuCompute.createTexture()

  fillTexture(dtRandom, () => [Math.random(), Math.random(), Math.random(), customRandomness2(0, 5000, easeInExpo)])
  fillTexture(dtInfo, () => [0, 0, 1, 0])

  const randomVariable = gpuCompute.addVariable('textureRandom', FragRandom, dtRandom)
  const velocityVariable = gpuCompute.addVariable('textureVelocity', FragVelocity, dtVelocity)
  const positionVariable = gpuCompute.addVariable('texturePosition', FragPosition, dtPosition)
  const infoVariable = gpuCompute.addVariable('textureInfo', FragInfo, dtInfo)

  gpuCompute.setVariableDependencies(randomVariable, [randomVariable])
  gpuCompute.setVariableDependencies(velocityVariable, [randomVariable, positionVariable, velocityVariable, infoVariable])
  gpuCompute.setVariableDependencies(infoVariable, [infoVariable, randomVariable])
  gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable, randomVariable, infoVariable])

  const vars = [randomVariable, velocityVariable, positionVariable, infoVariable]

  vars.forEach((v) => {
    v.material.defines.BOUNDS = texSize.toFixed(2)
    v.wrapS = THREE.RepeatWrapping
    v.wrapT = THREE.RepeatWrapping
  })

  const updateComputeUniforms = (time: number, delta: number, emitter: THREE.Vector3, emitDirection: THREE.Vector3) => {
    vars.forEach((v) => {
      const uni = v.material.uniforms

      uni['uTotalParticles'] = { value: count }
      uni['time'] = { value: time }
      uni['delta'] = { value: delta }
      uni['uEmitter'] = { value: emitter }
      uni['uEmitTowards'] = { value: emitDirection }

      Object.keys(controls.value).forEach((key) => {
        // @ts-ignore
        uni[key] = { value: Number(controls.value[key]) }
      })
    })
  }

  updateComputeUniforms(0.0, 0.0, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0))

  gpuCompute.init()

  const indexAttr = new AttributeGenerator(
    count,
    2,
    (_, i) => {
      if (!i) return [0, 0]
      const y = Math.floor(i / texSize)
      const x = i % texSize

      return [x / texSize, y / texSize]
    },
    undefined,
  )

  const posAttr = new AttributeGenerator(count, 3, () => [0, 0, 0])

  particlesGeo.setAttribute('position', posAttr.ba)
  particlesGeo.setAttribute('aTarget', indexAttr.ba)

  const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    transparent: true,
    vertexColors: true,

    depthWrite: false,
    uniforms: {
      uEmitter: {
        value: new THREE.Vector3(),
      },
      uScreenSize: {
        value: renderer.getSize(new THREE.Vector2()),
      },
      uSize: { value: renderer.getPixelRatio() },
      uTime: { value: 0 },
      uLightPos: { value: new THREE.Vector2(0, 50) },
      uLightPosX: { value: 0 },
      uLightPosY: { value: 0 },
      uLightPower: { value: 50 },
      uShadowDirectional: {
        value: 0.5,
      },
      uShadowRound: {
        value: 0.01,
      },
      uPosition: {
        value: gpuCompute.getCurrentRenderTarget(positionVariable).texture,
      },
      uVelocity: {
        value: gpuCompute.getCurrentRenderTarget(velocityVariable).texture,
      },
      uInfo: {
        value: gpuCompute.getCurrentRenderTarget(infoVariable).texture,
      },
      uRandom: {
        value: gpuCompute.getCurrentRenderTarget(randomVariable).texture,
      },
    },
  })

  const particles = new THREE.Points(particlesGeo, particleMaterial)
  scene.add(particles)

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(255, 255, 0),
    opacity: 0,
    transparent: true,
    side: THREE.DoubleSide,
  })

  const hiddenPlane = new THREE.PlaneGeometry(1000, 1000, 1, 1)
  scene.add(new THREE.Mesh(hiddenPlane, material))

  const clock = new THREE.Clock()
  clock.start()

  const raycaster = new THREE.Raycaster()
  const thePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1))
  const pointer = new THREE.Vector2()

  function onPointerMove(event: any) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  }
  addEventListener('mousemove', onPointerMove)

  let elapsedTime = 0

  const animationLoop: FrameRequestCallback = () => {
    if (!scene || !camera) return

    const delta = clock.getDelta()
    elapsedTime += delta

    raycaster.setFromCamera(pointer, camera)
    const cursorInSpace = new THREE.Vector3()
    raycaster.ray.intersectPlane(thePlane, cursorInSpace)

    let emitFrom = new THREE.Vector3(controls.value.emitAtX, controls.value.emitAtY, 0)
    let emitTowards = new THREE.Vector3(controls.value.emitTowardsY, controls.value.emitTowardsY, 0)

    if (controls.value.emitAtCursor) {
      emitFrom = cursorInSpace
    } else if (controls.value.emitAtLetter) {
      const radians = onLetterPosition.value.rotate * (Math.PI / 180)

      const tX = Math.cos(radians)
      const tY = Math.sin(radians)

      const letterEmitX = range(0, width.value, -1, 1, letterWrapperDims.left.value + onLetterPosition.value.translateX)
      const letterEmitY = range(0, height.value, 1, -1, letterWrapperDims.top.value + onLetterPosition.value.translateY)

      // -1 -1 left bottom 1 1 top right
      const emitCoords = new THREE.Vector2(letterEmitX, letterEmitY)

      raycaster.setFromCamera(emitCoords, camera)
      const emitFromInSpace = new THREE.Vector3()
      raycaster.ray.intersectPlane(thePlane, emitFromInSpace)

      emitFrom = emitFromInSpace
      emitTowards = new THREE.Vector3(emitFromInSpace.x + 300 * -tX, emitFromInSpace.y + 300 * tY, 0)
    }

    if (controls.value.emitTowardsCursor) {
      emitTowards = cursorInSpace
    }

    updateComputeUniforms(elapsedTime, delta, emitFrom, emitTowards)

    gpuCompute.compute()

    if (controls.value.lightAtCursor) {
      particleMaterial.uniforms.uLightPosX.value = cursorInSpace.x
      particleMaterial.uniforms.uLightPosY.value = cursorInSpace.y
    } else {
      particleMaterial.uniforms.uLightPosX.value = controls.value.uLightPosX
      particleMaterial.uniforms.uLightPosY.value = controls.value.uLightPosY
    }
    particleMaterial.uniforms.uLightPower.value = controls.value.uLightPower
    particleMaterial.uniforms.uShadowDirectional.value = controls.value.uShadowDirectional
    particleMaterial.uniforms.uShadowRound.value = controls.value.uShadowRound

    particleMaterial.uniforms.uTime.value = elapsedTime
    particleMaterial.uniforms.uPosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture
    particleMaterial.uniforms.uVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture
    particleMaterial.uniforms.uInfo.value = gpuCompute.getCurrentRenderTarget(infoVariable).texture
    particleMaterial.uniforms.uRandom.value = gpuCompute.getCurrentRenderTarget(randomVariable).texture

    renderer.render(scene, camera)
    requestAnimationFrame(animationLoop)
  }

  requestAnimationFrame(animationLoop)
}

onMounted(() => {
  initSim()
})
</script>
