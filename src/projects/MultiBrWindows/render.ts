import WindowManager from './windowManager'
import t from 'three'
import windowManager from './windowManager'

let camera
let scene
let renderer
let world
let near, far
let pixelRatio = window.devicePixelRatio ?? 1
let cubes = []
let sceneOffsetTarget = { x: 0, y: 0 }
let sceneOffset = { x: 0, y: 0 }
let today = new Date()
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
today.setMilliseconds(0)

today = today.getTime()
let wm
let initialized = false

function getTime() {
  return (new Date().getTime() - today) / 1000.0
}

function setupScene() {
  camera = new t.OrthographicCamera(0,0,window.innerWidth, window.innerHeight, -10_000, 10_000)
  camera.position.z = 2.5
  near = camera.position.z - .5
  far = camera.position.z + .5
  scene = new t.Scene()
  scene.background = new t.Color(0.0)
  scene.add(camera)
  renderer = new t.WebGL1Renderer({antialias: true, logarithmicDepthBuffer: true)
  renderer.setPixelRatio(pixelRatio)
  world = new t.Object3D()
  scene.add(world)
  renderer.domElement.setAttribute('id', 'scene')
  document.body.appendChild(renderer.domElement)
}

function init() {
  setTimeout(() => {
    initialized = true
  }, 500)
}

if (new URLSearchParams(window.location.search).get('clear')) {
  localStorage.clear()
} else {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' && !initialized) {
      init()
    }
  })
}
