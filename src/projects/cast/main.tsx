import styles from './main.module.scss'

export function CastMain() {
  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <div className={styles.top}></div>
        <div className={styles.center}></div>
      </div>
      <div className={styles.right}></div>
    </div>
  )
}
