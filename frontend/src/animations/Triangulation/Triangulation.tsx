import React, { useEffect } from 'react'

import './Triangulation.scss'
import { attachAnimation } from './util'

function Triangulation() {
  useEffect(() => {
    attachAnimation()
  }, [])

  return <div className="wrapper" />
}

export default Triangulation
