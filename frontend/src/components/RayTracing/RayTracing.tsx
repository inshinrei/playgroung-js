import React, { useRef, useEffect, CSSProperties } from 'react'

import { GUI } from 'dat.gui'
import { useForceUpdate } from 'hooks/useForceUpdate'
import { render } from './render'
import { defaultConfig, RenderOptions } from './options'

import styles from './RayTracing.module.scss'

const WIDTH = 800
const HEIGHT = 600

function RayTracing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const optionsRef = useRef<RenderOptions>({
    ...defaultConfig,
    width: WIDTH,
    height: HEIGHT,
  })

  const update = useForceUpdate()

  useEffect(() => {
    const gui = new GUI({ name: 'RayTracingRenderer' })
    const o = optionsRef.current

    gui.add(o, 'zoom', 0.5, 100, 0.5).onChange(update)
    gui.add(o, 'gamma', 0.5, 5, 0.1).onChange(update)
    gui.add(o, 'maxDepth', 0, 50, 1).onChange(update)
    gui.add(o, 'avgMixer', 0, 1, 0.01).onChange(update)
    gui.add(o, 'diffThreshold', 0, 3, 0.01).onChange(update)
    gui.add(o, 'highlightDiff').onChange(update)
    gui.add(o, 'useTrueLambertian').onChange(update)
    gui.add(o, 'diffuseRaysProbes', 0, 100, 1).onChange(update)
    gui.add(o, 'diffuseSecondRaysProbes', 0, 20, 1).onChange(update)

    return () => {
      gui.destroy()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      throw new Error('No canvas.')
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No canvas context.')
    }

    const { zoom } = optionsRef.current

    const width = Math.floor(WIDTH / 2 / zoom) * 2
    const height = Math.floor(HEIGHT / 2 / zoom) * 2

    if (canvas.width !== width) {
      console.log(`Insufficient width. Resetting canvas width to ${width}. (x${height} of height)`)

      canvas.width = width
      canvas.height = height

      canvas.style.setProperty('--zoom', zoom.toString())
      canvas.classList.toggle('zoom', zoom !== 1)
    }

    const imageData = ctx.createImageData(width, height)

    console.time('render_time')
    render(imageData, optionsRef.current)
    console.timeEnd('render_time')

    ctx.putImageData(imageData, 0, 0)
  })

  return (
    <div
      className={styles.wrapper}
      style={{ '--width': `${WIDTH}px`, '--height': `${HEIGHT}px` } as CSSProperties}
    >
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  )
}

export default RayTracing
