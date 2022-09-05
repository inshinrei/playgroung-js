import React, { useEffect } from 'react'

import styles from './Triangulation.module.scss'
import { attachAnimation } from './util'

function Triangulation() {
  useEffect(() => {
    attachAnimation()
  }, [])

  return <div className={styles.wrapper} />
}

export default Triangulation
