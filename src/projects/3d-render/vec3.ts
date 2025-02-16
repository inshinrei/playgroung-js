export class V3 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  static lerp(start: V3, end: V3, t: number) {
    return start.scale(1 - t).plus(end.scale(t))
  }

  scale(scalar: number) {
    return new V3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  plus(vec: V3) {
    return new V3(this.x + vec.x, this.y + vec.y, this.z + vec.z)
  }

  minus(vec: V3) {
    return new V3(this.x - vec.x, this.y - vec.y, this.z - vec.z)
  }

  dot(vec: V3) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z
  }

  normalized() {
    let mag = Math.sqrt(this.dot(this))
    return new V3(this.x / mag, this.y / mag, this.z / mag)
  }
}

export class Ray {
  constructor(
    public origin: V3,
    public direction: V3,
  ) {}

  at(t: number) {
    return this.origin.plus(this.direction.scale(t))
  }
}
