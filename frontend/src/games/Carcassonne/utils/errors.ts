export function shouldExist<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) {
    throw new Error(`${value} should exist`)
  }

  return value
}

export function neverCall(): unknown {
  throw new Error('Never call')
}
