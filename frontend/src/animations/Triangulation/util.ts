import Delaunator from 'delaunator'

export function attachAnimation() {
  const wrapper = document.querySelector('.wrapper')
  const root = document.createElement('div')

  const points = []
  const step = 25

  for (let x = 0; x <= 100; x += step) {
    for (let y = 0; y <= 100; y += step) {
      let pointX = x,
        pointY = y

      if (x > 0 && x < 100) {
        pointX += Math.random() * step * 2 - step
      }

      if (y > 0 && y < 100) {
        pointY += Math.random() * step * 2 - step
      }

      points.push(pointX)
      points.push(pointY)
    }
  }

  const delaunator = new Delaunator(points)
  const triangles = delaunator.triangles

  for (let i = 0; i < triangles.length / 3; i++) {
    const a = 2 * triangles[i * 3],
      b = 2 * triangles[i * 3 + 1],
      c = 2 * triangles[i * 3 + 2]

    const Ax = points[a],
      Ay = points[a + 1],
      Bx = points[b],
      By = points[b + 1],
      Cx = points[c],
      Cy = points[c + 1]

    const centerX = (Ax + Bx + Cx) / 3,
      centerY = (Ay + By + Cy) / 3

    const polygon = `${Ax}% ${Ay}%, ${Bx}% ${By}%, ${Cx}% ${Cy}%`

    const imageWrapper = document.createElement('div')

    imageWrapper.classList.add('image')
    imageWrapper.style.clipPath = `polygon(${polygon}`
    imageWrapper.style.transformOrigin = `${centerX}% ${centerY}%`
    imageWrapper.style.animationDelay = `${Math.random() * 500}ms`

    root.appendChild(imageWrapper)
  }

  root.classList.add('root')
  wrapper?.appendChild(root)
}
