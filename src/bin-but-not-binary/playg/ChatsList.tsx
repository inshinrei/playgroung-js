import { InfiniteScroll, useInfiniteScroll } from './InfiniteList'
import { useRef } from 'react'
import styles from './InfiniteList.module.scss'

type RecentsListProps = {
  className?: string
  isActive: boolean
  // extract in component, no props
  entries: Array<string>
}

const DEFAULT_LIST_SLICE = 30
const INTERSECTION_THROTTLE = 200
const DRAG_ENTER_DEBOUNCE = 500
const RESERVED_HOTKEYS = new Set(['9', '0'])
const CHAT_HEIGHT_PX = 60

export function RecentsList({
  className,
  entries,
  isActive,
}: RecentsListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const orderedIds = entries
  const listHeight = orderedIds.length * CHAT_HEIGHT_PX
  const archiveHeight = 60
  const [viewportIds, getMore] = useInfiniteScroll(
    undefined,
    orderedIds,
    undefined,
    DEFAULT_LIST_SLICE,
  )

  function renderRecents() {
    const viewportOffset = orderedIds!.indexOf(viewportIds![0])
    const pinnedCount = 0
    return viewportIds!.map((id, i) => {
      const isPinned = false
      const offsetTop = archiveHeight + (viewportOffset + i) * CHAT_HEIGHT_PX
      return (
        <div
          style={{ top: offsetTop + 'px' }}
          className={`ListItem ${styles.item}`}
        >{`${id} ${offsetTop}`}</div>
      )
    })
  }

  return (
    <InfiniteScroll
      onLoadMore={getMore}
      entries={viewportIds}
      ref={containerRef}
      maxHeight={listHeight + archiveHeight}
      preloadBackwards={DEFAULT_LIST_SLICE}
      entrySelector=".ListItem"
      className={styles.list}
    >
      {viewportIds?.length ? renderRecents() : null}
    </InfiniteScroll>
  )
}
