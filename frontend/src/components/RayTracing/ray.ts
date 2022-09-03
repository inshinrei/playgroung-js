import { vec3 } from 'gl-matrix'

export type point3 = vec3
export type Ray = {
  origin: point3
  dir: vec3
}

export const pointAtRay = (ray: Ray, scaleBy: number): point3 =>
  vec3.add(vec3.create(), ray?.origin, vec3.scale(vec3.create(), ray?.dir, scaleBy))
