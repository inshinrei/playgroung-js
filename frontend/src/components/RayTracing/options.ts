export type RenderOptions = {
  diffThreshold: number
  avgMixer: number
  width: number
  height: number
  zoom: number
  gamma: number
  maxDepth: number
  diffuseRaysProbes: number
  diffuseSecondRaysProbes: number

  useTrueLambertian: boolean
  highlightDiff: boolean
}

export const defaultConfig: Omit<RenderOptions, 'width' | 'height'> = {
  avgMixer: 0.45,
  diffThreshold: 0.25,
  highlightDiff: false,
  zoom: 1,
  gamma: 1,
  maxDepth: 10,
  diffuseRaysProbes: 10,
  diffuseSecondRaysProbes: 1,
  useTrueLambertian: false,
}
