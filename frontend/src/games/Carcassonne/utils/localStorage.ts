import { LOCAL_STORAGE_PREFIX } from '../data/constants'

export function saveToLocalStorage<T>(key: string, revision: number, data: T) {
  const json = JSON.stringify({ revision, data })
  window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}.${key}`, json)
}

export function loadFromLocalStorage<T>(key: string, revision: number): T | null {
  const json = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}.${key}`)

  if (!json) {
    return null
  }

  const item = JSON.parse(json)

  if (item.revision !== revision) {
    return null
  }

  return item.data as T
}
