export const Currencies = ['BTC', 'ETH', 'DOG', 'LTC']

export const Provider = [
  'evolution',
  'pragmaticplay',
  'gameart',
  'amatic',
  'spinomenal',
  'booming',
  'nucleus',
  'habanero',
  'bgaming',
]

export type GameType = {
  title: string
  provider: string
  collections: {
    novelty: number
    popularity: number
    slots: number
    _hd: number
    all: number
  }
  real: {
    BTC: { id: number }
    DOG: { id: number }
    LTC: { id: number }
    ETH: { id: number }
  }
  demo: string
}
