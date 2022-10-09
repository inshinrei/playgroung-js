export function on<T extends Window | Document | HTMLElement | EventTarget>(
  domObject: T | null,
  ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]
): void {
  if (domObject?.addEventListener) {
    domObject.addEventListener(...(args as Parameters<HTMLElement['addEventListener']>))
  }
}

export function off<T extends Window | Document | HTMLElement | EventTarget>(
  domObject: T | null,
  ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]
): void {
  if (domObject?.removeEventListener) {
    domObject.removeEventListener(...(args as Parameters<HTMLElement['removeEventListener']>))
  }
}
