// TODO?: use 32-bit signed integer since it's faster in JS
import { vec3 } from 'gl-matrix'

import { point3, pointAtRay, Ray } from './ray'
import { color, Hit, MaterialType, ObjectType, Scene, SphereObject } from './types'

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
            dir = refract(dirNormalized, cosTheta, nearestHit.normat, refractionRatio)
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
