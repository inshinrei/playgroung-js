import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { GetMore, LoadMoreBackwards, LoadMoreDirection } from './types'
import { debounce, requestForcedReflow, resetScroll } from './schedulers'
import { useLastCallback, usePrevious } from './hooks'
import { buildStyle } from './buildStyle'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { areSortedArraysEqual } from './iterates'

type Props = {
  ref?: RefObject<HTMLDivElement>
  style?: React.CSSProperties
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
  // replace on use state ref
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
          onLoadMore({ direction: LoadMoreDirection.Forwards })
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
    if (loadMoreForwards && loadMoreBackwards) {
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
    let handleNativeScroll = (e: Event) => {
      handleScroll(e as unknown as React.UIEvent<HTMLDivElement>)
    }
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

export function useInfiniteScroll<ListId extends string | number>(
  loadMoreBackwards?: LoadMoreBackwards,
  listIds?: ListId[],
  isDisabled = false,
  listSlice = 30,
): [ListId[]?, GetMore?, number?] {
  let requestParamsRef = useRef<{
    direction?: LoadMoreDirection
    offsetId?: ListId
  }>()
  let currentStateRef = useRef<
    { viewportIds: ListId[]; isOnTop: boolean; offset: number } | undefined
  >()
  if (!currentStateRef.current && listIds && !isDisabled) {
    let { newViewportIds, newIsOnTop, fromOffset } = getViewportSlice(
      listIds,
      LoadMoreDirection.Forwards,
      listSlice,
      listIds[0],
    )
    currentStateRef.current = {
      viewportIds: newViewportIds,
      isOnTop: newIsOnTop,
      offset: fromOffset,
    }
  }
  let forceUpdate = useForceUpdate()
  if (isDisabled) {
    requestParamsRef.current = {}
  }
  let prevListIds = usePrevious(listIds)
  let prevIsDisabled = usePrevious(isDisabled)
  if (
    listIds &&
    !isDisabled &&
    (listIds !== prevListIds || isDisabled !== prevIsDisabled)
  ) {
    let { viewportIds, isOnTop } = currentStateRef.current || {}
    let currentMiddleId =
      viewportIds && !isOnTop
        ? viewportIds[Math.round(viewportIds.length / 2)]
        : undefined
    let defaultOffsetId =
      currentMiddleId && listIds.includes(currentMiddleId)
        ? currentMiddleId
        : listIds[0]
    let { offsetId = defaultOffsetId, direction = LoadMoreDirection.Forwards } =
      requestParamsRef.current || {}
    let { newViewportIds, newIsOnTop, fromOffset } = getViewportSlice(
      listIds,
      direction,
      listSlice,
      offsetId,
    )
    requestParamsRef.current = {}
    if (!viewportIds || !areSortedArraysEqual(viewportIds, newViewportIds)) {
      currentStateRef.current = {
        viewportIds: newViewportIds,
        isOnTop: newIsOnTop,
        offset: fromOffset,
      }
    }
  } else if (!listIds) {
    currentStateRef.current = undefined
  }

  const getMore: GetMore = useLastCallback(
    ({
      direction,
      noScroll,
    }: {
      direction: LoadMoreDirection
      noScroll?: boolean
    }) => {
      let { viewportIds } = currentStateRef.current || {}
      let offsetId = viewportIds
        ? direction === LoadMoreDirection.Backwards
          ? viewportIds[viewportIds.length - 1]
          : viewportIds[0]
        : undefined
      console.debug('request get more: ', direction, viewportIds, offsetId)
      if (!listIds) {
        if (loadMoreBackwards) {
          loadMoreBackwards({ offsetId })
        }
        return
      }
      let {
        newViewportIds,
        areSomeLocal,
        areAllLocal,
        newIsOnTop,
        fromOffset,
      } = getViewportSlice(listIds, direction, listSlice, offsetId)
      if (
        areSomeLocal &&
        !(viewportIds && areSortedArraysEqual(viewportIds, newViewportIds))
      ) {
        currentStateRef.current = {
          viewportIds: newViewportIds,
          isOnTop: newIsOnTop,
          offset: fromOffset,
        }
        forceUpdate()
      }
      if (!areAllLocal && loadMoreBackwards) {
        if (!noScroll) {
          requestParamsRef.current = {
            ...requestParamsRef.current,
            direction,
            offsetId,
          }
        }
        loadMoreBackwards({ offsetId })
      }
    },
  )
  return isDisabled
    ? [listIds]
    : [
        currentStateRef.current?.viewportIds,
        getMore,
        currentStateRef.current?.offset,
      ]
}

function getViewportSlice<ListId extends string | number>(
  sourceIds: ListId[],
  direction: LoadMoreDirection,
  listSlice: number,
  offsetId?: ListId,
) {
  let { length } = sourceIds
  console.debug('offsetId: ', offsetId)
  console.debug('sourceIds: ', sourceIds)
  let index = offsetId ? sourceIds.indexOf(offsetId) : 0
  console.debug('index: ', index)
  let isForwards = direction === LoadMoreDirection.Forwards
  let indexForDirection = isForwards ? index : index + 1 || length
  console.debug('indexForDirection: ', indexForDirection)
  indexForDirection += 30
  let from = Math.max(0, indexForDirection - listSlice)
  let to = indexForDirection + listSlice - 1
  let newViewportIds = sourceIds.slice(Math.max(0, from), to + 1)
  let areSomeLocal
  let areAllLocal
  switch (direction) {
    case LoadMoreDirection.Forwards:
      areSomeLocal = indexForDirection >= 0
      areAllLocal = from >= 0
      break
    case LoadMoreDirection.Backwards:
      areSomeLocal = indexForDirection < length
      areAllLocal = to <= length - 1
      break
  }
  console.debug('getViewportSlice: ', index, from, to, newViewportIds)
  return {
    newViewportIds,
    areSomeLocal,
    areAllLocal,
    newIsOnTop: newViewportIds[0] === sourceIds[0],
    fromOffset: from,
  }
}
