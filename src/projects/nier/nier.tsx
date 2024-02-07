import React, { useEffect, useRef } from 'react'
import styles from './nier.module.scss'
import { drawPlayer } from './canvas/player'

export function ProjectNier() {
  let canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvas.current) {
      drawPlayer(canvas.current)
    }
  }, [canvas.current])

  return (
    <div className={styles.root}>
      <canvas ref={canvas} color="red" />
    </div>
  )
}
