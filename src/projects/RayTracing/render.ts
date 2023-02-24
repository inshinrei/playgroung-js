import { vec3 } from 'gl-matrix'

import type { RenderOptions } from './options'
import { point3, pointAtRay, Ray } from './ray'
import {
  color,
  Hit,
  MaterialType,
  ObjectType,
  Scene,
  SphereObject,
} from './types'
import { scene } from './scene'

function getSquaredLen(vec: vec3): number {
  return vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2
}

function getSphereHit(
  { center, radius, material }: SphereObject,
  ray: Ray,
  min: number,
  max: number
): Hit | null {
  let oc = vec3.sub(vec3.create(), ray.origin, center)
  let a = getSquaredLen(ray.dir)
  let b = vec3.dot(oc, ray.dir)
  let c = getSquaredLen(oc) - radius ** 2
  let d = b ** 2 - 4 * a * c
  if (d < 0) {
    return null
  }

  let sqrtD = Math.sqrt(d)
  let root = (-b - sqrtD) / a
  if (root < min || max < root) {
    root = (-b + sqrtD) / a
    if (root < min || max < root) {
      return null
    }
  }

  let hitPoint = pointAtRay(ray, root)
  let normal = vec3.create()
  vec3.sub(normal, hitPoint, center)
  vec3.scale(normal, normal, 1 / radius)
  let isFrontFace = vec3.dot(ray.dir, normal) < 0
  if (!isFrontFace) {
    vec3.scale(normal, normal, -1)
  }

  return {
    t: root,
    point: hitPoint,
    normal,
    isFrontFace,
    material,
  }
}

function randomInUnitSphere(): point3 {
  while (true) {
    let point = vec3.fromValues(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )

    if (getSquaredLen(point) < 1) {
      return point
    }
  }
}

function randomOnUnitSphere(): point3 {
  let point = randomInUnitSphere()
  return vec3.normalize(point, point)
}

function reflect(ray: vec3, normal: vec3): vec3 {
  let r = vec3.create()
  let diff = vec3.scale(vec3.create(), normal, 2 * vec3.dot(ray, normal))
  vec3.sub(r, ray, diff)
  return r
}

function refract(
  unitDirection: vec3,
  cos_theta: number,
  normal: vec3,
  e_over_et: number
): vec3 {
  let r_out_prep = vec3.scale(vec3.create(), normal, cos_theta)
  vec3.add(r_out_prep, r_out_prep, unitDirection)
  vec3.scale(r_out_prep, r_out_prep, e_over_et)
  let r_out_parallel = vec3.scale(
    vec3.create(),
    normal,
    -Math.sqrt(Math.abs(1.0 - getSquaredLen(r_out_prep)))
  )

  return vec3.add(vec3.create(), r_out_prep, r_out_parallel)
}

function isNearZero(vec: vec3): boolean {
  let eps = 1e-8
  return (
    Math.abs(vec[0]) < eps && Math.abs(vec[1]) < eps && Math.abs(vec[2]) < eps
  )
}

function reflectance(cosine: number, ref_idx: number): number {
  let r0 = ((1 - ref_idx) / (1 + ref_idx)) ** 2
  return r0 + (1 - r0) * (1 - cosine) ** 5
}

function getColorFromScene(
  options: RenderOptions,
  scene: Scene,
  ray: Ray,
  min: number,
  max: number,
  depth: number
): color {
  let nearestHit: Hit | null = null
  for (const obj of scene.objects) {
    switch (obj.type) {
      case ObjectType.SPHERE:
        let hit = getSphereHit(obj, ray, min, nearestHit ? nearestHit.t : max)
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

    let probes =
      depth === options.maxDepth
        ? options.diffuseRaysProbes
        : options.diffuseSecondRaysProbes
    let accColor = vec3.create()
    if (probes === 0) {
      return [0, 0, 0]
    }

    for (let i = 0; i < probes; i++) {
      let { material } = nearestHit
      let dir: vec3

      switch (material.type) {
        case MaterialType.SMOOTH: {
          let randomPoint = options.useTrueLambertian
            ? randomOnUnitSphere()
            : randomInUnitSphere()
          dir = vec3.add(vec3.create(), nearestHit.normal, randomPoint)
          if (isNearZero(dir)) {
            dir = nearestHit.normal
          }

          break
        }

        case MaterialType.METAL: {
          dir = reflect(
            vec3.normalize(vec3.create(), ray.dir),
            nearestHit.normal
          )
          if (material.fuzz > 0) {
            let fuzz = vec3.scale(
              vec3.create(),
              randomInUnitSphere(),
              material.fuzz
            )
            vec3.add(dir, dir, fuzz)
          }

          if (vec3.dot(dir, nearestHit.normal) <= 0) {
            continue
          }

          break
        }

        case MaterialType.DIELECTRIC: {
          let refraction_ratio = nearestHit.isFrontFace
            ? 1.0 / material.refractionIndex
            : material.refractionIndex
          let dirNormalized = vec3.normalize(vec3.create(), ray.dir)
          let cos_theta = Math.min(
            vec3.dot(
              vec3.scale(vec3.create(), dirNormalized, -1),
              nearestHit.normal
            )
          )
          let sin_theta = Math.sqrt(1 - cos_theta ** 2)
          if (
            refraction_ratio * sin_theta > 1 ||
            reflectance(cos_theta, refraction_ratio) > Math.random()
          ) {
            dir = reflect(dirNormalized, nearestHit.normal)
          } else {
            dir = refract(
              dirNormalized,
              cos_theta,
              nearestHit.normal,
              refraction_ratio
            )
          }

          break
        }
      }

      let newRay = {
        origin: nearestHit.point,
        dir,
      }

      let tracedColor = getColorFromScene(
        options,
        scene,
        newRay,
        0.001,
        Infinity,
        depth - 1
      )
      vec3.mul(tracedColor, tracedColor, material.color)
      vec3.add(accColor, accColor, tracedColor)
    }

    return vec3.scale(accColor, accColor, 1 / probes)
  }

  let unitDirection = vec3.normalize(vec3.create(), ray.dir)
  let tt = 0.5 * (unitDirection[1] + 1)
  return vec3.add(
    vec3.create(),
    vec3.scale(vec3.create(), vec3.fromValues(1, 1, 1), 1 - tt),
    vec3.scale(vec3.create(), vec3.fromValues(0.5, 0.7, 1), tt)
  )
}

function getColorDiff(color1: color, color2: color): number {
  return (
    Math.abs(color1[0] - color2[0]) +
    Math.abs(color1[1] - color2[1]) +
    Math.abs(color1[2] - color2[2])
  )
}

export function render(imageData: ImageData, options: RenderOptions) {
  let { width, height, data } = imageData
  let { avgMixer, diffThreshold, highlightDiff, maxDepth } = options
  let all = 0
  let overDiff = 0

  function writePixel(color: Readonly<vec3>, offset: number): void {
    let [r, g, b] = color.values()
    if (options.gamma !== 1) {
      let power = 1 / options.gamma
      r = r ** power
      g = g ** power
      b = b ** power
    }

    let ir = Math.floor(255.999 * r)
    let ig = Math.floor(255.999 * g)
    let ib = Math.floor(255.99 * b)
    data.set([ir, ig, ib, 255], offset)
  }

  function getColorAt(offset: number): color {
    let pixelData = data.slice(offset, offset + 4)
    return [pixelData[0] / 256, pixelData[1] / 256, pixelData[2] / 256]
  }

  let aspectRation = width / height
  let viewportHeight = 2.0
  let viewportWidth = aspectRation * viewportHeight
  let focalLen = 1.0
  let origin = vec3.fromValues(0, 0, 0)
  let horizontal = vec3.fromValues(viewportWidth, 0, 0)
  let vertical = vec3.fromValues(0, viewportHeight, 0)
  let lowerLeftCorner = vec3.subtract(
    vec3.create(),
    origin,
    vec3.fromValues(viewportWidth / 2, viewportHeight / 2, focalLen)
  )

  function getColorByXY(x: number, y: number): color {
    let u = x / width
    let v = 1 - y / height
    let dir = vec3.create()
    vec3.add(dir, lowerLeftCorner, vec3.scale(vec3.create(), horizontal, u))
    vec3.add(dir, dir, vec3.scale(vec3.create(), vertical, v))
    vec3.sub(dir, dir, origin)
    let r = { origin, dir }

    return getColorFromScene(options, scene, r, 0, Infinity, maxDepth)
  }

  let fillRedPixels: { x: number; y: number }[] = []
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      let avgColor = getColorByXY(x + 0.5, y + 0.5)
      let sumDiff = 0
      if (y > 0) {
        let upColor = getColorAt(((y - 1) * width + x + 1) * 4)
        sumDiff += getColorDiff(avgColor, upColor)
      }

      if (x > 0) {
        let leftColor = getColorAt((y * width + x - 1) * 4)
        sumDiff += getColorDiff(avgColor, leftColor)
      }

      let color1: color, color2: color, color3: color, color4: color
      if (sumDiff > diffThreshold) {
        overDiff++
        color1 = getColorByXY(x, y)
        color2 = getColorByXY(x + 1, y)
        color3 = getColorByXY(x, y + 1)
        color4 = getColorByXY(x + 1, y + 1)
        let avgColor = vec3.create()
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
    let red = [1, 0, 0] as const
    writePixel(red, (y * width + x) * 4)
    writePixel(red, (y * width + x + 1) * 4)
    writePixel(red, ((y + 1) * width + x) * 4)
    writePixel(red, ((y + 1) * width + x + 1) * 4)
  }

  console.log('-------------------------')
  console.log(
    `renderResolution=${width}x${height} basePixelsCount=${all} needDetails=${overDiff} needDetailsRatio=${(
      (overDiff * 100) /
      all
    ).toFixed(2)}% totalPixels=${all - overDiff + overDiff * 4}`
  )
}
