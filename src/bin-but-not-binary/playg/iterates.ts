export function areSortedArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) {
    return false
  }
  return array1.every((item, i) => item === array2[i])
}
