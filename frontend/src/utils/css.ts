export const getCSSVar = (key: string, element: HTMLElement = document?.documentElement) =>
  getComputedStyle(element).getPropertyValue(key)
