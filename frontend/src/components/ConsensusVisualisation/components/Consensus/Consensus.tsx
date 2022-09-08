import React, { useMemo, useState, useCallback } from 'react'
import times from 'lodash.times'

import Options from '../Options'
import NodeVisualisation from '../NodeVisualisation'

import { Network } from '../../utils/Network'
import { NetworkInterface } from '../../utils/NetworkInterface'
import { ConsensusNode } from '../../utils/ConsensusNode'

import type { NetworkOptions } from '../../utils/types'

import styles from './Consensus.module.scss'

export const NODES_COUNT = 2

function Consensus() {
  const [networkOptions, setNetworkOptions] = useState<NetworkOptions>({
    avgLatency: 100,
    lossRate: 0.1,
  })

  const { network, nodes } = useMemo(() => {
    const network = new Network({ networkOptions })
    const nodes = times(NODES_COUNT, index => `node_${index}`).map(
      nodeName =>
        new ConsensusNode({
          networkInterface: new NetworkInterface(network, nodeName),
          nodeName,
        })
    )

    return { network, nodes }
  }, [])

  const handleSetNetworkOptions = useCallback(
    (options: NetworkOptions) => {
      setNetworkOptions(options)
      network.applyOptions(options)
    },
    [network]
  )

  return (
    <div className={styles.root}>
      <Options options={networkOptions} onChange={handleSetNetworkOptions} />

      <div className={styles.nodesPanel}>
        {nodes.map(({ nodeName }) => (
          <NodeVisualisation key={nodeName} nodeName={nodeName} />
        ))}
      </div>
    </div>
  )
}

export default Consensus
