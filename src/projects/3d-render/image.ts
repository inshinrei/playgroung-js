import { Color } from './color'

export class Image {
  public canvas: {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    imageData: ImageData
    pixels: Uint8ClampedArray
  } | null

  constructor(
    public w: number,
    public h: number,
  ) {
    this.canvas = this.makeCanvas()
  }

  putPixel(x: number, y: number, c: Color) {
    if (!this.canvas) {
      return
    }
    let offset = (y * this.w + x) * 4
    this.canvas.pixels[offset] = c.r | 0
    this.canvas.pixels[offset + 1] = c.g | 0
    this.canvas.pixels[offset + 2] = c.b | 0
    this.canvas.pixels[offset + 3] = 255
  }

  renderInto(element: HTMLElement) {
    if (!this.canvas) {
      return
    }
    this.canvas.context.putImageData(this.canvas.imageData, 0, 0)
  }

  private makeCanvas() {
    let canvas = document.createElement('canvas')
    canvas.setAttribute('width', `${this.w}px`)
    canvas.setAttribute('height', `${this.h}px`)
    let context = canvas.getContext('2d')
    if (!context) {
      return null
    }
    let imageData = context.getImageData(0, 0, this.w, this.h)
    let pixels = imageData.data
    return {
      canvas,
      context,
      imageData,
      pixels,
    }
  }
}
