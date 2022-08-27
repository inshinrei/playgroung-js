export const getCSSVar = (key: string, element: HTMLElement) =>
  getComputedStyle(element).getPropertyValue(key)
