export function drawPlayer(c: HTMLCanvasElement) {
  let ctx = c.getContext('2d')
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(75, 50)
    ctx.lineTo(100, 75)
    ctx.fill()
  }
}
