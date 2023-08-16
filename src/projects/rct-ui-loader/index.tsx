import React from 'react'
import styles from './index.module.scss'

function Loader() {
  return (
    <div className={styles.fox}>
      <div className={styles.leg_outer}>
        <div className={styles.leg}>
          <div className={styles.paw}>
            <div className={styles.log}>
              <div className={styles.log_inner}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.leg_outer}>
        <div className={styles.leg}>
          <div className={styles.paw}>
            <div className={styles.log}>
              <div className={styles.log_inner}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.hind_leg_outer}>
        <div className={styles.hind_leg_outer_2}>
          <div className={styles.hind_paw}>
            <div className={styles.hind_log}>
              <div className={styles.hind_log_inner}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.hind_leg_outer}>
        <div className={styles.hind_leg_outer_2}>
          <div className={styles.hind_paw}>
            <div className={styles.hind_log}>
              <div className={styles.hind_log_inner}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.ears}>
            <div className={styles.ear}></div>
            <div className={styles.ear}></div>
          </div>
          <div className={styles.face}></div>
          <div className={styles.snout}></div>
        </div>
        <div className={styles.tail}>
          <div className={styles.tail}>
            <div className={styles.tail}>
              <div className={styles.tail}>
                <div className={styles.tail}>
                  <div className={styles.tail}></div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.tail_2}>
            <div className={styles.tail}>
              <div className={styles.tail}>
                <div className={styles.tail}>
                  <div className={styles.tail}>
                    <div className={styles.tail}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loader
