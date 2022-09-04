// TODO?: use 32-bit signed integer since it's faster in JS
import { vec3 } from 'gl-matrix'

import { point3, pointAtRay, Ray } from './ray'
import { color, Hit, MaterialType, ObjectType, Scene, SphereObject } from './types'
import { scene } from './scene'

import type { RenderOptions } from './options'

function getSquaredLength(vec: vec3): number {
  return vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2
}

function isNearZero(vec: vec3): boolean {
  const epsilon = 1e-8

  return Math.abs(vec[0]) < epsilon && Math.abs(vec[1]) < epsilon && Math.abs(vec[2]) < epsilon
}

function reflectance(cosine: number, refIdx: number): number {
  // TODO?: Schlick's approximation for reflectance might be faster
  const r0 = ((1 - refIdx) / (1 + refIdx)) ** 2
  return r0 + (1 - r0) * (1 - cosine) ** 5
}

function randomInUnitSphere(): point3 {
  while (true) {
    const point = vec3.fromValues(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )

    if (getSquaredLength(point) < 1) {
      return point
    }
  }
}

function randomOnUnitSphere(): point3 {
  const point = randomInUnitSphere()
  return vec3.normalize(point, point)
}

function getColorDiff(color1: color, color2: color): number {
  return (
    Math.abs(color1[0] - color2[0]) +
    Math.abs(color1[1] - color2[1]) +
    Math.abs(color1[2] - color2[2])
  )
}

function refract(unitDirection: vec3, cosTheta: number, normal: vec3, etaiOverEtat: number): vec3 {
  const rOutPerp = vec3.scale(vec3.create(), normal, cosTheta)

  vec3.add(rOutPerp, rOutPerp, unitDirection)
  vec3.scale(rOutPerp, rOutPerp, etaiOverEtat)

  const rOutParallel = vec3.scale(
    vec3.create(),
    normal,
    -Math.sqrt(Math.abs(1.0 - getSquaredLength(rOutPerp)))
  )

  return vec3.add(vec3.create(), rOutPerp, rOutParallel)
}

function reflect(ray: vec3, normal: vec3): vec3 {
  const r = vec3.create()
  const diff = vec3.scale(vec3.create(), normal, 2 * vec3.dot(ray, normal))

  vec3.sub(r, ray, diff)

  // TODO: unit vector
  // vec3.normalize(r, r)
  // const len = getSquaredLength(r)
  // if (len<0.99 || len>1.01) {
  //   debugger
  // }

  return r
}

function getSphereHit(
  { center, radius, material }: SphereObject,
  ray: Ray,
  min: number,
  max: number
): Hit | undefined {
  const oc = vec3.sub(vec3.create(), ray.origin, center),
    a = getSquaredLength(ray.dir),
    b = vec3.dot(oc, ray.dir),
    c = getSquaredLength(oc) - radius ** 2,
    discriminant = b ** 2 - a * c

  if (discriminant < 0) {
    return undefined
  }

  const sqrtD = Math.sqrt(discriminant)
  let root = (-b - sqrtD) / a

  if (root < min || max < root) {
    root = (-b + sqrtD) / a

    if (root < min || max < root) {
      return undefined
    }
  }

  const hitPoint = pointAtRay(ray, root)

  const normal = vec3.create()
  vec3.sub(normal, hitPoint, center)
  vec3.scale(normal, normal, 1 / radius)

  const isFrontFace = vec3.dot(ray.dir, normal) < 0
  if (!isFrontFace) {
    vec3.scale(normal, normal, -1)
  }

  return { t: root, point: hitPoint, normal, isFrontFace, material }
}

function getColorFromScene(
  options: RenderOptions,
  scene: Scene,
  ray: Ray,
  min: number,
  max: number,
  depth: number
): color {
  let nearestHit: Hit | undefined

  for (const obj of scene.objects) {
    switch (obj.type) {
      case ObjectType.SPHERE:
        const hit = getSphereHit(obj, ray, min, nearestHit ? nearestHit.t : max)

        if (hit) {
          nearestHit = hit
        }
        break
    }
  }

  if (nearestHit) {
    if (depth <= 1) {
      return [0, 0, 0]
    }

    // const color = vec3.create()
    //
    // vec3.add(color, nearestHit.normal, vec.fromValues(1, 1, 1))
    // vec3.scale(color, color, 0.5)
    //
    // return color

    const probes =
      depth === options.maxDepth ? options.diffuseRaysProbes : options.diffuseSecondRaysProbes
    const accColor = vec3.create()

    if (probes === 0) {
      return [0, 0, 0]
    }

    for (let i = 0; i < probes; i++) {
      const { material } = nearestHit
      let dir: vec3

      switch (material.type) {
        case MaterialType.SMOOTH: {
          const randomPoint = options.useTrueLambertian
            ? randomOnUnitSphere()
            : randomInUnitSphere()

          dir = vec3.add(vec3.create(), nearestHit.normal, randomPoint)

          if (isNearZero(dir)) {
            dir = nearestHit.normal
          }

          break
        }

        case MaterialType.METAL: {
          dir = reflect(vec3.normalize(vec3.create(), ray.dir), nearestHit.normal)

          if (material.fuzz > 0) {
            const fuzz = vec3.scale(vec3.create(), randomInUnitSphere(), material.fuzz)
            vec3.add(dir, dir, fuzz)
          }

          if (vec3.dot(dir, nearestHit.normal) <= 0) {
            continue
          }

          break
        }

        case MaterialType.DIELECTRIC: {
          const refractionRatio = nearestHit.isFrontFace
            ? 1.0 / material.refractionIndex
            : material.refractionIndex

          const dirNormalized = vec3.normalize(vec3.create(), ray.dir)

          const cosTheta = Math.min(
            vec3.dot(vec3.scale(vec3.create(), dirNormalized, -1), nearestHit.normal),
            1
          )

          const sinTheta = Math.sqrt(1 - cosTheta ** 2)

          if (
            refractionRatio * sinTheta > 1 ||
            reflectance(cosTheta, refractionRatio) > Math.random()
          ) {
            dir = reflect(dirNormalized, nearestHit.normal)
          } else {
            dir = refract(dirNormalized, cosTheta, nearestHit.normal, refractionRatio)
          }

          break
        }
      }

      const newRay = {
        origin: nearestHit.point,
        dir,
      }

      const tracedColor = getColorFromScene(options, scene, newRay, 0.001, Infinity, depth - 1)

      vec3.mul(tracedColor, tracedColor, material.color)
      vec3.add(accColor, accColor, tracedColor)
    }

    return vec3.scale(accColor, accColor, 1 / probes)
  }

  const unitDirection = vec3.normalize(vec3.create(), ray.dir)
  const tt = 0.5 * (unitDirection[1] + 1)

  return vec3.add(
    vec3.create(),
    vec3.scale(vec3.create(), vec3.fromValues(1, 1, 1), 1 - tt),
    vec3.scale(vec3.create(), vec3.fromValues(0.5, 0.7, 1), tt)
  )
}

export function render(imageData: ImageData, options: RenderOptions) {
  const { width, height, data } = imageData
  const { avgMixer, diffThreshold, highlightDiff, maxDepth } = options

  let all = 0,
    overDiff = 0

  function writePixel(color: Readonly<vec3>, offset: number): void {
    // @ts-ignore
    let [r, g, b] = color.values()

    if (options.gamma !== 1) {
      const power = 1 / options.gamma

      r = r ** power
      g = g ** power
      b = b ** power
    }

    const ir = Math.floor(255.99 * r),
      ig = Math.floor(255.999 * g),
      ib = Math.floor(255.999 * b)

    data.set([ir, ig, ib, 255], offset)
  }

  function getColorAt(offset: number): color {
    const pixelData = data.slice(offset, offset + 4)
    return [pixelData[0] / 256, pixelData[1] / 256, pixelData[2] / 256]
  }

  const aspectRatio = width / height

  const viewportHeight = 2.0,
    viewportWidth = aspectRatio * viewportHeight,
    focalLength = 1.0

  const origin = vec3.fromValues(0, 0, 0),
    horizontal = vec3.fromValues(viewportWidth, 0, 0),
    vertical = vec3.fromValues(0, viewportHeight, 0)

  const lowerLeftCorner = vec3.subtract(
    vec3.create(),
    origin,
    vec3.fromValues(viewportWidth / 2, viewportHeight / 2, focalLength)
  )

  function getColorByXY(x: number, y: number) {
    const u = x / width,
      v = 1 - y / height

    const dir = vec3.create()

    vec3.add(dir, lowerLeftCorner, vec3.scale(vec3.create(), horizontal, u))
    vec3.add(dir, dir, vec3.scale(vec3.create(), vertical, v))
    vec3.sub(dir, dir, origin)

    const r = { origin, dir }

    return getColorFromScene(options, scene, r, 0, Infinity, maxDepth)
  }

  const fillRedPixels: { x: number; y: number }[] = []

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const avgColor = getColorByXY(x + 0.5, y + 0.5)
      let sumDiff = 0

      if (y > 0) {
        const upColor = getColorAt(((y - 1) * width + x + 1) * 4)
        sumDiff += getColorDiff(avgColor, upColor)
      }

      if (x > 0) {
        const leftColor = getColorAt((y * width + x - 1) * 4)
        sumDiff += getColorDiff(avgColor, leftColor)
      }

      let color1: color, color2: color, color3: color, color4: color

      if (sumDiff > diffThreshold) {
        overDiff++

        color1 = getColorByXY(x, y)
        color2 = getColorByXY(x + 1, y)
        color3 = getColorByXY(x, y + 1)
        color4 = getColorByXY(x + 1, y + 1)

        const avgColor = vec3.create()

        vec3.add(avgColor, avgColor, color1)
        vec3.add(avgColor, avgColor, color2)
        vec3.add(avgColor, avgColor, color3)
        vec3.add(avgColor, avgColor, color4)

        vec3.scale(avgColor, avgColor, 0.25)

        vec3.lerp(color1, color1, avgColor, avgMixer)
        vec3.lerp(color2, color2, avgColor, avgMixer)
        vec3.lerp(color3, color3, avgColor, avgMixer)
        vec3.lerp(color4, color4, avgColor, avgMixer)

        if (highlightDiff) {
          fillRedPixels.push({ x, y })
        }
      } else {
        color1 = avgColor
        color2 = avgColor
        color3 = avgColor
        color4 = avgColor
      }

      all++

      writePixel(color1, (y * width + x) * 4)
      writePixel(color2, (y * width + x + 1) * 4)
      writePixel(color3, ((y + 1) * width + x) * 4)
      writePixel(color4, ((y + 1) * width + x + 1) * 4)
    }
  }

  for (const { x, y } of fillRedPixels) {
    const red = [1, 0, 0] as const

    writePixel(red, (y * width + x) * 4)
    writePixel(red, (y * width + x + 1) * 4)
    writePixel(red, ((y + 1) * width + x) * 4)
    writePixel(red, ((y + 1) * width + x + 1) * 4)
  }

  console.log('====================')
  console.log(
    `renderResolution=${width}x${height} basePixelsCount=${all} needDetails=${overDiff} needDetailsRatio=${(
      (overDiff * 100) /
      all
    ).toFixed(2)}% totalPixels=${all - overDiff + overDiff * 4}`
  )
}
