import styles from './dsevents.module.scss'
import { Logger } from './main'
import { useEffect, useRef } from 'react'
import { useForceUpdate } from '../../hooks/useForceUpdate'

export function DsEvents() {
  let update = useForceUpdate()
  let r = useRef(null)
  let l: Logger | null = null
  useEffect(() => {
    if (r.current) {
      l = new Logger(r.current)
      update()
    }
  }, [])
  return (
    <div className={styles.root}>
      <div ref={r}></div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span onClick={() => l!.l('log')}>log</span>
        <span onClick={() => l!.i('info')}>info</span>
        <span onClick={() => l!.e('error')}>error</span>
      </div>
    </div>
  )
}
