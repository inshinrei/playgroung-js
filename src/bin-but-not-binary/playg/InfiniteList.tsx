import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'

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

// debounce,
// g type
type AnyToVoidFunction = (...args: any[]) => void
type NoneToVoidFunction = () => void
type AnyFunction = (...args: any[]) => any

// module: schedulers

type Scheduler = typeof requestAnimationFrame

function debounce<F extends AnyToVoidFunction>(
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

function throttleWith<F extends AnyToVoidFunction>(
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

function fastRaf(cb: NoneToVoidFunction, withTimeoutFallback = false) {
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

function safeExec<F extends AnyFunction>(
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

function requestForcedReflow(cb: () => NoneToVoidFunction | void) {
  pendingForceReflowTasks.push(cb)
  runUpdatePassOnRaf()
}

function throttleWithRafFallback<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith((throttledFn: NoneToVoidFunction) => {
    fastRaf(throttledFn, true)
  }, fn)
}

// module: stand alone name
function forceReflow(element: HTMLElement) {
  element.offsetWidth
}

// resetscroll
function resetScroll(container: HTMLDivElement, scrollTop?: number) {
  // if ios -> container.style.overflow = hidden
  if (scrollTop !== undefined) {
    container.scrollTop = scrollTop
  }
  // if ios -> overflow = '' or unset
}

// module: useStateRef
// allows to use state silently, without causing updates
function useStateRef<T>(value: T) {
  let ref = useRef<T>(value)
  ref.current = value
  return ref
}

// module: uselastcallback
function useLastCallback<F extends AnyFunction>(cb?: F) {
  let ref = useStateRef(cb)
  return useCallback(
    (...args: Parameters<F>) => ref.current?.(...args),
    [],
  ) as F
}

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
