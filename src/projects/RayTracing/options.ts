export type RenderOptions = {
  avgMixer: number
  highlightDiff: boolean
  width: number
  height: number
  zoom: number
  gamma: number
  maxDepth: number
  useTrueLambertian: boolean
  diffThreshold: number
  diffuseRaysProbes: number
  diffuseSecondRaysProbes: number
}

export const defaultConfig: Omit<RenderOptions, 'width' | 'height'> = {
  avgMixer: 0.45,
  highlightDiff: false,
  zoom: 1,
  gamma: 1,
  maxDepth: 10,
  useTrueLambertian: false,
  diffThreshold: 0.25,
  diffuseRaysProbes: 10,
  diffuseSecondRaysProbes: 1,
}
