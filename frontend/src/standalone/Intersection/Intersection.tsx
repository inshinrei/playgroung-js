import React from 'react'

import styles from './Intersection.module.scss'

function Intersection() {
  return (
    <div>
      <header>
        <nav className={styles.headerNav}>
          <div className={styles.headerLeftContent}>
            <a>Home</a>
          </div>
          <ul className={styles.headerList}>
            <li>
              <a>About us</a>
            </li>
            <li>
              <a>The flavours</a>
            </li>
            <li>
              <a>Get in touch</a>
            </li>
          </ul>
        </nav>
      </header>

      <div>
        <section data-section="raspberry" id="home"></section>
        <section data-section="mint" id="about-us"></section>
        <section data-section="vanilla" id="the-flavours"></section>
        <section data-section="chocolate" id="get-in-touch"></section>
      </div>
    </div>
  )
}

export default Intersection
