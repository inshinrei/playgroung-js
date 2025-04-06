import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

enum LoadMoreDirection {}

type Props = {
  ref?: RefObject<HTMLDivElement>
  style?: string
  className?: string
  entries?: any[]
  entrySelector?: string
  preloadBackwards?: number
  sensitiveArea?: number
  withAbsolutePositioning?: boolean
  maxHeight?: number
  noScrollRestore?: boolean
  noScrollRestoreOnTop?: boolean
  cacheBuster?: any
  beforeChildren?: React.ReactNode
  scrollContainerClosest?: string
  children: React.ReactNode
  onLoadMore?: ({
    direction,
  }: {
    direction: LoadMoreDirection
    noScroll?: boolean
  }) => void
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<any>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
}

const DEFAULT_LIST_SELECTOR = '.listitem'
const DEFAULT_PRELOAD_BACKWARDS = 20
const DEFAULT_SENSITIVE_AREA = 800

// debounce
function debounce() {}

// requestRepaint
function requestForcedReflow() {}

// resetscroll
function resetScroll() {}

// uselastcallback
function useLastCallback() {}

// build style
function buildStyle() {}

export function InfiniteScroll({
  ref,
  style,
  className,
  entries,
  entrySelector = DEFAULT_LIST_SELECTOR,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  sensitiveArea = DEFAULT_SENSITIVE_AREA,
  withAbsolutePositioning,
  maxHeight,
  noScrollRestore = false,
  noScrollRestoreOnTop = false,
  cacheBuster,
  beforeChildren,
  children,
  scrollContainerClosest,
  onLoadMore,
  onScroll,
  onWheel,
  onClick,
  onKeyDown,
  onDragOver,
  onDragLeave,
}: Props) {
  let containerRef = useRef<HTMLDivElement>(null)
  if (ref) {
    containerRef = ref
  }
  let stateRef = useRef<{
    listItemElements?: NodeListOf<HTMLDivElement>
    isScrollTopJustUpdated?: boolean
    currentAnchor?: HTMLDivElement | undefined
    currentAnchorTop?: number
  }>({})
  let [loadMoreBackwards, loadMoreForwards] = useMemo(() => {
    if (!onLoadMore) {
      return []
    }
    return [
      debounce(
        (noScroll = false) => {
          onLoadMore({ direction: LoadMoreDirection.Backwards, noScroll })
        },
        1000,
        true,
        false,
      ),
      debounce(
        () => {
          onLoadMore({ direction: LoadMoreDirection.Forwads })
        },
        1000,
        true,
        false,
      ),
    ]
  }, [onLoadMore, entries])

  useEffect(() => {
    let scrollContainer = scrollContainerClosest
      ? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)
      : containerRef.current
    if (!loadMoreBackwards || !scrollContainer) {
      return
    }
    if (
      preloadBackwards > 0 &&
      (!entries || entries.length < preloadBackwards)
    ) {
      loadMoreBackwards(true)
      return
    }
    let { scrollHeight, clientHeight } = scrollContainer
    if (clientHeight && scrollHeight < clientHeight) {
      loadMoreBackwards()
    }
  }, [entries, loadMoreBackwards, preloadBackwards, scrollContainerClosest])

  useLayoutEffect(() => {
    let scrollContainer = scrollContainerClosest
      ? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
      : containerRef.current!
    let container = containerRef.current
    requestForcedReflow(() => {
      let state = stateRef.current
      state.listItemElements = container!.querySelectorAll(entrySelector)
      let newScrollTop: number
      if (
        state.currentAnchor &&
        Array.from(state.listItemElements).includes(state.currentAnchor)
      ) {
        let { scrollTop } = scrollContainer
        let newAnchorTop = state.currentAnchor.getBoundingClientRect().top
        newScrollTop = scrollTop + (newAnchorTop - state.currentAnchorTop!)
      } else {
        let nextAnchor = state.listItemElements[0]
        if (nextAnchor) {
          state.currentAnchor = nextAnchor
          state.currentAnchorTop = nextAnchor.getBoundingClientRect().top
        }
      }
      if (withAbsolutePositioning || noScrollRestore) {
        return undefined
      }
      let { scrollTop } = scrollContainer
      if (noScrollRestoreOnTop && scrollTop === 0) {
        return undefined
      }
      return () => {
        resetScroll(scrollContainer, newScrollTop)
        state.isScrollTopJustUpdated = true
      }
    })
  }, [
    entries,
    entrySelector,
    noScrollRestore,
    noScrollRestoreOnTop,
    cacheBuster,
    withAbsolutePositioning,
    scrollContainerClosest,
  ])

  const handleScroll = useLastCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (loadMoreBackwards && loadMoreForwards) {
      let { isScrollTopJustUpdated, currentAnchor, currentAnchorTop } =
        stateRef.current
      let listItemElements = stateRef.current.listItemElements!
      if (isScrollTopJustUpdated) {
        stateRef.current.isScrollTopJustUpdated = false
        return
      }
      let listLength = listItemElements.length
      let scrollContainer = scrollContainerClosest
        ? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
        : containerRef.current!
      let { scrollTop, scrollHeight, offsetHeight } = scrollContainer
      let top = listLength ? listItemElements[0].offsetTop : 0
      let isNearTop = scrollTop <= top + sensitiveArea
      let bottom = listLength
        ? listItemElements[listLength - 1].offsetTop +
          listItemElements[listLength - 1].offsetHeight
        : scrollHeight
      let isNearBottom = bottom - (scrollTop + offsetHeight) <= sensitiveArea
      let isUpdated = false

      if (isNearTop) {
        let nextAnchor = listItemElements[0]
        if (nextAnchor) {
          let nextAnchorTop = nextAnchor.getBoundingClientRect().top
          let newAnchorTop =
            currentAnchor?.offsetParent && currentAnchor !== nextAnchor
              ? currentAnchor.getBoundingClientRect().top
              : nextAnchorTop
          let isMovingUp =
            currentAnchor &&
            currentAnchorTop !== undefined &&
            newAnchorTop > currentAnchorTop
          if (isMovingUp) {
            stateRef.current.currentAnchor = nextAnchor
            stateRef.current.currentAnchorTop = nextAnchorTop
            isUpdated = true
            loadMoreForwards()
          }
        }
      }

      if (isNearBottom) {
        let nextAnchor = listItemElements[listLength - 1]
        if (nextAnchor) {
          let nextAnchorTop = nextAnchor.getBoundingClientRect().top
          let newAnchorTop =
            currentAnchor?.offsetParent && currentAnchor !== nextAnchor
              ? currentAnchor.getBoundingClientRect().top
              : nextAnchorTop
          let isMovingDown =
            currentAnchor &&
            currentAnchorTop !== undefined &&
            newAnchorTop < currentAnchorTop
          if (isMovingDown) {
            stateRef.current.currentAnchor = nextAnchor
            stateRef.current.currentAnchorTop = nextAnchorTop
            isUpdated = true
            loadMoreBackwards()
          }
        }
      }

      if (!isUpdated) {
        if (currentAnchor?.offsetParent) {
          stateRef.current.currentAnchorTop =
            currentAnchor.getBoundingClientRect().top
        } else {
          let nextAnchor = listItemElements[0]
          if (nextAnchor) {
            stateRef.current.currentAnchor = nextAnchor
            stateRef.current.currentAnchorTop =
              nextAnchor.getBoundingClientRect().top
          }
        }
      }
    }

    if (onScroll) {
      onScroll(e)
    }
  })

  useLayoutEffect(() => {
    let scrollContainer = scrollContainerClosest
      ? containerRef.current!.closest<HTMLDivElement>(scrollContainerClosest)!
      : containerRef.current!
    if (!scrollContainer) {
      return undefined
    }
    let handleNativeScroll = (e: Event) =>
      handleScroll(e as unknown as React.UIEvent<HTMLDivElement>)
    scrollContainer.addEventListener('scroll', handleNativeScroll)
    return () => {
      scrollContainer.removeEventListener('scroll', handleNativeScroll)
    }
  }, [handleScroll, scrollContainerClosest])

  return (
    <div
      ref={containerRef}
      className={className}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      style={style}
    >
      {beforeChildren}
      {withAbsolutePositioning && entries?.length ? (
        <div style={buildStyle('position: relative', `height: ${maxHeight}px`)}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
