import styles from './dsevents.module.scss'
import cn from 'classnames'

export function DsEvents() {
  return (
    <div className={styles.root}>
      <div className={styles.bars}>
        <Bar />
        <Bar revert />
      </div>
      <ul>
        <li>event 1</li>
        <li>event 2</li>
      </ul>
    </div>
  )
}

function Bar({ revert = false }) {
  return <div className={cn(styles.bar, { [styles.revert]: revert })} />
}
