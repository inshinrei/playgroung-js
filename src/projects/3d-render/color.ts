export class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
  ) {}

  times(c: Color) {
    return new Color(this.r * c.r, this.g * c.g, this.b * c.b)
  }

  scale(scalar: number) {
    return new Color(this.r * scalar, this.g * scalar, this.b * scalar)
  }

  addInPlace(c: Color) {
    this.r += c.r
    this.g += c.g
    this.b += c.b
  }

  clampInPlace() {
    this.r = this.r < 0 ? 0 : this.r > 1 ? 1 : this.r
    this.g = this.g < 0 ? 0 : this.g > 1 ? 1 : this.g
    this.b = this.b < 0 ? 0 : this.b > 1 ? 1 : this.b
  }
}
