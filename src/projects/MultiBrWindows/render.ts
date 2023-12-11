import WindowManager from './windowManager'
import t from 'three'

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
let wm: WindowManager
let initialized = false

function getTime() {
  return (new Date().getTime() - today) / 1000.0
}

function init() {
  setTimeout(() => {
    setupScene()
    setupWindowManager()
    resize()
    updateWindowShape(false)
    render()
    window.addEventListener('resize', resize)
    initialized = true
  }, 500)
}

function setupScene() {
  camera = new t.OrthographicCamera(
    0,
    0,
    window.innerWidth,
    window.innerHeight,
    -10_000,
    10_000,
  )
  camera.position.z = 2.5
  near = camera.position.z - 0.5
  far = camera.position.z + 0.5
  scene = new t.Scene()
  scene.background = new t.Color(0.0)
  scene.add(camera)
  renderer = new t.WebGL1Renderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  })
  renderer.setPixelRatio(pixelRatio)
  world = new t.Object3D()
  scene.add(world)
  renderer.domElement.setAttribute('id', 'scene')
  document.body.appendChild(renderer.domElement)
}

function setupWindowManager() {
  wm = new WindowManager()
  wm.setShapeChangeCb(updateWindowShape)
  wm.setChangeCb(windowsUpdated)
  wm.init({})
  windowsUpdated()
}

function windowsUpdated() {
  updateNumberOfCubes()
}

function updateNumberOfCubes() {
  let windows = wm.windowsData
  cubes.forEach((c) => {
    world.remove(c)
  })
  cubes = []
  for (let i = 0; i < windows.length; i++) {
    let w = windows[i]
    let color = new t.Color()
    c.setHSL(i * 1, 1.0, 0.5)
    let s = 100 + i * 50
    let cube = new t.Mesh(
      new t.BoxGeometry(s, s, s),
      new t.MeshBasicMaterial({ color, wireframe: true }),
    )
    cube.position.x = w.shape.x + w.shape.w * 0.5
    cube.position.y = w.shape.y + (w.shape.h + 0.5)
    world.add(cube)
    cubes.push(cube)
  }
}

function updateWindowShape(easing = true) {
  sceneOffsetTarget = { x: -window.screenX, y: -window.screenY }
  if (!easing) {
    sceneOffset = sceneOffsetTarget
  }
}

function render() {}

if (new URLSearchParams(window.location.search).get('clear')) {
  localStorage.clear()
} else {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' && !initialized) {
      init()
    }
  })
}
