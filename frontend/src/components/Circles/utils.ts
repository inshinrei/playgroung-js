const Words = ['Abobus']
const quality = 10

interface Circle {
  x: number
  y: number
  r: number
  ctx: CanvasRenderingContext2D
  isGrowing: boolean
  show: () => void
  growing: () => void
  isCircleGrowing: (value: boolean) => void
}

class Circle {
  private readonly x: number
  private readonly y: number

  private r: number
  private ctx: CanvasRenderingContext2D

  private isGrowing = true

  constructor(x: number, y: number, ctx: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.r = 1

    this.ctx = ctx
  }

  public growing() {
    if (this.isGrowing) {
      this.r++
    }
  }

  public set isCircleGrowing(isGrowing: boolean) {
    this.isGrowing = isGrowing
  }

  public show() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    this.ctx.stroke()
    this.ctx.closePath()
  }
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function gRA(min: number, max: number) {
  const minCeil = Math.ceil(min)
  const maxFloored = Math.floor(max)

  return Math.floor(Math.random() * (maxFloored - minCeil + 1)) + minCeil
}

function registerCircles(canvasId: string, secondCanvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement

  if (!canvas) {
    throw new Error(`No canvas was found with id ${canvasId}`)
  }

  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  if (!context) {
    throw new Error(`No context was found`)
  }

  const secondCanvas = document.getElementById(secondCanvasId) as HTMLCanvasElement

  if (!secondCanvas) {
    throw new Error(`No second canvas was found with id ${secondCanvasId}`)
  }

  const secondContext = secondCanvas.getContext('2d') as CanvasRenderingContext2D

  if (!secondContext) {
    throw new Error('No second context was found')
  }

  const width = window.innerWidth
  const height = window.innerHeight

  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  canvas.setAttribute('height', String(height))
  canvas.setAttribute('width', String(width))

  secondCanvas.style.width = width + 'px'
  secondCanvas.style.height = height + 'px'
  secondCanvas.setAttribute('height', String(height))
  secondCanvas.setAttribute('width', String(width))

  secondContext.textAlign = 'center'
  secondContext.textBaseline = 'middle'

  function replayAnimation() {
    let drawNext = true

    function reverse() {
      window.removeEventListener('click', reverse)
      drawNext = false
    }

    window.addEventListener('click', reverse)
    context.clearRect(0, 0, width, height)
    secondContext.clearRect(0, 0, width, height)

    const word = Words[gRA(0, Words.length - 1)]

    secondContext.font = 'normal 900' + (w / word.length + 2) + 'px sans-serif'
    secondContext.fillText(word, width / 2, height / 2)

    const possibleSpots = []
    const circles: Circle[] = []

    for (let i = 0; i < secondCanvas.width; i += 5) {
      for (let g = 0; g < secondCanvas.height; g += 5) {
        const imageData = secondContext.getImageData(i, g, 1, 1).data

        if (imageData[0] > 0 || imageData[1] > 0 || imageData[2] > 0 || imageData[3] > 0) {
          possibleSpots.push({ x: i, y: g })

          for (let l = 0; l < 5; l += 1) {
            for (let h = 0; h < 5; h += 1) {
              possibleSpots.push({ x: i + l, y: g + h })
            }
          }
        }
      }
    }

    secondContext.clearRect(0, 0, width, height)
    let counter = 0

    function newCircle() {
      const newSpot = possibleSpots[gRA(0, possibleSpots.length - 1)]
      let draw = true

      for (circle of circles) {
        if (dist(circle.x, circle.y, newSpot.x, newSpot.y) <= circle.r) {
          draw = false
          break
        }
      }

      if (draw) {
        circles.push(new Circle(newSpot.x, newSpot.y, context))
      }
    }

    function loop() {
      context.clearRect(0, 0, width, height)
      counter++

      for (let i = 0; i < quality; i += 1) {
        newCircle()
      }

      for (const circle of circles) {
        for (const circle1 of circles) {
          if (circle !== circle1) {
            if (dist(circle.x, circle.y, circle1.x, circle1.y) < circle.r + circle1.r) {
              circle.isCircleGrowing(false)
              break
            }
          }
        }

        circle.show()
        circle.growing()
      }

      if (drawNext) {
        window.requestAnimationFrame(() => {
          loop()
        })
      }
    }

    loop()
  }

  replayAnimation()
}
