import { Ray, V3 } from './vec3'

export class Sphere {
  constructor(
    public center: V3,
    public radius: number,
    public material: number,
  ) {}

  intersection(ray: Ray) {
    let cp = ray.origin.minus(this.center)
    let a = ray.direction.dot(ray.direction)
    let b = 2 * cp.dot(ray.direction)
    let c = cp.dot(cp) - this.radius ** 2
    let d = b ** 2 - 4 * a * c
    if (d < 0) {
      return null
    }
    let sqrt = Math.sqrt(d)
    let ts = []
    let sub = (-b - sqrt) / (2 * a)
    if (sub >= 0) {
      ts.push(sub)
    }
    let add = (-b + sqrt) / (2 * a)
    if (add >= 0) {
      ts.push(add)
    }
    if (ts.length === 0) {
      return null
    }
    return Math.min.apply(null, ts)
  }

  normalAt(point: V3) {
    return point.minus(this.center).normalized()
  }
}
