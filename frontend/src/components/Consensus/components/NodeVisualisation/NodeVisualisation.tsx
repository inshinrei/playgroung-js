import React from 'react'

import styles from './NodeVisualisation.module.scss'

type Props = {
  nodeName: string
}

function NodeVisualisation({ nodeName }: Props) {
  return <div className={styles.root}>{`Node: ${nodeName}`}</div>
}

export default NodeVisualisation
