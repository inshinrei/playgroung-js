import { AnyFunction, AnyToVoidFunction, NoneToVoidFunction } from './types'

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
  // @ts-ignore
  return throttleWith((throttledFn: NoneToVoidFunction) => {
    fastRaf(throttledFn, true)
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
