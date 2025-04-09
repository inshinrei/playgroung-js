import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styles from './InfiniteList.module.scss'
import { LoadMoreDirection } from './types'

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

type Scheduler = typeof requestAnimationFrame

export function debounce<F extends AnyToVoidFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true,
) {
  let waitingTimeout: number | undefined
  return (...args: Parameters<F>) => {
    if (waitingTimeout) {
      clearTimeout(waitingTimeout)
      waitingTimeout = undefined
    } else if (shouldRunFirst) {
      fn(...args)
    }
    waitingTimeout = self.setTimeout(() => {
      if (shouldRunLast) {
        fn(...args)
      }
      waitingTimeout = undefined
    }, ms)
  }
}

export function throttleWith<F extends AnyToVoidFunction>(
  schedulerFn: Scheduler,
  fn: F,
) {
  let waiting = false
  let args: Parameters<F>
  return (..._args: Parameters<F>) => {
    args = _args
    if (!waiting) {
      waiting = true
      schedulerFn(() => {
        waiting = false
        fn(...args)
      })
    }
  }
}

let fastRafCallbacks: Set<NoneToVoidFunction> | undefined
let fastRafFallbackCallbacks: Set<NoneToVoidFunction> | undefined
let fastRafFallbackTimeout: number | undefined

const FAST_RAF_TIMEOUT_FALLBACK_MS = 35 // < 30 FPS

export function fastRaf(cb: NoneToVoidFunction, withTimeoutFallback = false) {
  if (!fastRafCallbacks) {
    fastRafCallbacks = new Set([cb])
    requestAnimationFrame(() => {
      let currentCallbacks = fastRafCallbacks!
      fastRafCallbacks = undefined
      fastRafFallbackCallbacks = undefined
      if (fastRafFallbackTimeout) {
        clearTimeout(fastRafFallbackTimeout)
        fastRafFallbackTimeout = undefined
      }
      currentCallbacks.forEach((c) => c())
    })
  } else {
    fastRafCallbacks.add(cb)
  }
  if (withTimeoutFallback) {
    if (!fastRafFallbackCallbacks) {
      fastRafFallbackCallbacks = new Set([cb])
    } else {
      fastRafFallbackCallbacks.add(cb)
    }
    if (!fastRafFallbackTimeout) {
      fastRafFallbackTimeout = self.setTimeout(() => {
        let currentTimeoutCallbacks = fastRafCallbacks!
        if (fastRafCallbacks) {
          currentTimeoutCallbacks.forEach(
            fastRafCallbacks.delete,
            fastRafCallbacks,
          )
        }
        fastRafFallbackCallbacks = undefined
        if (fastRafFallbackTimeout) {
          clearTimeout(fastRafFallbackTimeout)
          fastRafFallbackTimeout = undefined
        }
        currentTimeoutCallbacks.forEach((c) => c())
      }, FAST_RAF_TIMEOUT_FALLBACK_MS)
    }
  }
}

// requestRepaint, module: dom
// refactor to Set>?
let pendingForceReflowTasks: Array<() => NoneToVoidFunction | void> = []
let pendingMutationTasks: Array<NoneToVoidFunction> = []
let pendingMeasureTasks: Array<NoneToVoidFunction> = []

type Phase = 'measure' | 'mutate'
let phase = 'measure'

function setPhase(newPhase: Phase) {
  phase = newPhase
}

let SAFE_EXEC_ENABLED = true // !DEBUG
type SafeExecOptions = {
  rescue?: (err: Error) => void
  always?: NoneToVoidFunction
  shouldIgnoreError?: boolean
}

export function safeExec<F extends AnyFunction>(
  cb: F,
  options: SafeExecOptions = {},
): ReturnType<F> | undefined {
  if (!SAFE_EXEC_ENABLED) {
    return cb()
  }
  let { rescue, always, shouldIgnoreError } = options
  try {
    return cb()
  } catch (err: any) {
    rescue?.(err)
    if (!shouldIgnoreError) {
      // report error
    }
    return undefined
  } finally {
    always?.()
  }
}

const runUpdatePassOnRaf = throttleWithRafFallback(() => {
  let currentMeasureTasks = pendingMeasureTasks
  pendingMeasureTasks = []
  currentMeasureTasks.forEach((task) => {
    safeExec(task)
  })
  // for correct order for mutation observer microtasks
  Promise.resolve()
    .then(() => {
      setPhase('mutate')
      let currentMutationTasks = pendingMutationTasks
      pendingMutationTasks = []
      currentMutationTasks.forEach((task) => {
        safeExec(task)
      })
    })
    .then(() => {
      setPhase('measure')
      let pendingForceReflowMutationTasks: Array<NoneToVoidFunction> = []
      for (const task of pendingForceReflowTasks) {
        safeExec(() => {
          let mutationTask = task()
          if (mutationTask) {
            pendingForceReflowMutationTasks.push(mutationTask)
          }
        })
      }
      pendingForceReflowTasks = []
      return pendingForceReflowMutationTasks
    })
    .then((pendingForceReflowMutationTasks) => {
      setPhase('mutate')
      for (const task of pendingForceReflowMutationTasks) {
        safeExec(task)
      }
    })
    .then(() => {
      setPhase('measure')
    })
})

export function requestForcedReflow(cb: () => NoneToVoidFunction | void) {
  pendingForceReflowTasks.push(cb)
  runUpdatePassOnRaf()
}

export function throttleWithRafFallback<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith((throttledFn: NoneToVoidFunction) => {
    fastRaf(throttledFn, true)
    return 0
  }, fn)
}

export function forceReflow(element: HTMLElement) {
  element.offsetWidth
}

export function resetScroll(container: HTMLDivElement, scrollTop?: number) {
  // if ios -> container.style.overflow = hidden
  if (scrollTop !== undefined) {
    container.scrollTop = scrollTop
  }
  // if ios -> overflow = '' or unset
}

export function useStateRef<T>(value: T) {
  let ref = useRef<T>(value)
  ref.current = value
  return ref
}

export function useLastCallback<F extends AnyFunction>(cb?: F) {
  let ref = useStateRef(cb)
  return useCallback(
    (...args: Parameters<F>) => ref.current?.(...args),
    [],
  ) as F
}

type BuildStyleParts = (string | false | undefined)[]

export function buildStyle(...parts: BuildStyleParts): string {
  return parts.filter(Boolean).join(';')
}

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

// now the main list..... aaaah
// module: useForceUpdate
function useForceUpdate() {
  let [, trigger] = useState(false)
  return useCallback(() => {
    trigger((s) => !s)
  }, [])
}

// module: usePrevious
function usePrevious<T extends any>(next: T, shouldSkipUndefined?: boolean) {
  let ref = useRef<T>()
  let { current } = ref
  if (!shouldSkipUndefined || next !== undefined) {
    ref.current = next
  }
  return current
}

function usePrevNew<T extends any>(current: T) {
  let prevRef = useRef<T>()
  let lastRef = useRef<T>()
  if (lastRef.current !== current) {
    prevRef.current = lastRef.current
  }
  lastRef.current = current
  return prevRef.current
}

// module: iteratees
function areSortedArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) {
    return false
  }
  return array1.every((item, i) => item === array2[i])
}

// module: useInfiniteScroll
type GetMore = (args: { direction: LoadMoreDirection }) => void
type LoadMoreBackwards = (args: { offsetId?: number | string }) => void

function useInfiniteScroll<ListId extends string | number>(
  loadMoreBackwards?: LoadMoreBackwards,
  listIds?: ListId[],
  isDisabled = false,
  listSlice = DEFAULT_LIST_SLICE,
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
  let index = offsetId ? sourceIds.indexOf(offsetId) : 0
  console.debug('index: ', index)
  let isForwards = direction === LoadMoreDirection.Forwards
  let indexForDirection = isForwards ? index : index + 1 || length
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
  return {
    newViewportIds,
    areSomeLocal,
    areAllLocal,
    newIsOnTop: newViewportIds[0] === sourceIds[0],
    fromOffset: from,
  }
}

// recents list
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
