import React, { useEffect, useRef } from 'react'
import styles from './nier.module.scss'
import { drawPlayer } from './canvas/player'
import { Provider } from 'mobx-react'
import RootStore from './store/RootStore'

export function ProjectNier() {
  let canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvas.current) {
      drawPlayer(canvas.current)
    }
  }, [canvas.current])

  return (
    <div className={styles.root}>
      <Provider rootStore={RootStore}>
        <canvas ref={canvas} color="red" />
      </Provider>
    </div>
  )
}
