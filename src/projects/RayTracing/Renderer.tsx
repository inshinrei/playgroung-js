import { CSSProperties, useEffect, useRef } from 'react'
import { GUI } from 'dat.gui'

import { defaultConfig, RenderOptions } from './options'
import { render } from './render'
import styles from './Renderer.module.scss'
import { useForceUpdate } from '../../hooks/useForceUpdate'

const WIDTH = 800
const HEIGHT = 600

function Renderer() {
  let canvasRef = useRef<HTMLCanvasElement>(null)
  let optionsRef = useRef<RenderOptions>({
    ...defaultConfig,
    width: WIDTH,
    height: HEIGHT,
  })

  let update = useForceUpdate()
  useEffect(() => {
    let gui = new GUI({ name: 'Ray Tracing Renderer' })
    let options = optionsRef.current
    gui.add(options, 'avgMixer', 0, 1, 0.01).onChange(update)
    gui.add(options, 'zoom', 0.5, 100, 0.5).onChange(update)
    gui.add(options, 'gamma', 0.5, 5, 0.1).onChange(update)
    gui.add(options, 'maxDepth', 0, 50, 1).onChange(update)
    gui.add(options, 'highlightDiff').onChange(update)
    gui.add(options, 'useTrueLambertian').onChange(update)
    gui.add(options, 'diffThreshold', 0, 3, 0.01).onChange(update)
    gui.add(options, 'diffuseRaysProbes', 0, 100, 1).onChange(update)
    gui.add(options, 'diffuseSecondRaysProbes', 0, 20, 1).onChange(update)
    return () => {
      gui.destroy()
    }
  }, [])

  useEffect(() => {
    let canvas = canvasRef.current
    if (!canvas) {
      throw new Error('No canvas was provided.')
    }

    let ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('No canvas context.')
    }

    let { zoom, width, height } = optionsRef.current
    let w = Math.floor(width / 2 / zoom) * 2
    let h = Math.floor(height / 2 / zoom) * 2
    if (canvas.width !== w) {
      console.log(`resetting canvas width to ${w}x${h}`)
      canvas.width = w
      canvas.height = h
      canvas.style.setProperty('--zoom', zoom.toString())
      canvas.classList.toggle('zoom', zoom !== 1)
    }

    let imageData = ctx.createImageData(width, height)
    console.time('renderTime')
    render(imageData, optionsRef.current)
    console.timeEnd('renderTime')
    ctx.putImageData(imageData, 0, 0)
  })

  return (
    <div
      className={styles.root}
      style={
        { '--width': `${WIDTH}px`, '--height': `${HEIGHT}px` } as CSSProperties
      }
    >
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  )
}

export default Renderer
