export type CellID = number

export interface CellCoords {
  cellID: CellID
  col: number
  row: number
}

export type CardTypeID = `card:${string}`

export const enum SideType {
  TOWN = 1,
  ROAD = 2,
}

export const enum Side {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
}

export const enum Building {
  Monastery = 1,
}

export type UnionIndex = number

export interface Union {
  unionSides: Side[]
  unionSideType: SideType.TOWN | SideType.ROAD
}

export interface CardBase {
  sides: [SideType | undefined, SideType | undefined, SideType | undefined, SideType | undefined]
  connects: [number, number, number, number]
  building?: Building
}

export interface InGameCard extends CardBase {
  cardTypeID: CardTypeID
  isPrimeTown: boolean
  unions: Union[]
}

export interface Point {
  x: number
  y: number
}

export type PlayerIndex = number

export const enum GameObjectType {
  ROAD = 1,
  TOWN = 2,
  MONASTERY = 3,
}

export type PeasantPlace = { type: 'CENTER' } | { type: 'UNION'; unionIndex: number }

export interface Peasant {
  playerIndex: number
  place: PeasantPlace
}

export interface Zone {
  card: InGameCard
  coords: CellCoords
  peasant: Peasant | undefined
  meta: {
    turnNumber: number
    placeByPlayerIndex: PlayerIndex | undefined
  }
}

export type Zones = Map<number, Zone>

export const enum Color {
  RED = 0,
  BLUE = 1,
  YELLOW = 2,
  GREEN = 3,
  BLACK = 4,
}

export interface MenuPlayer {
  name: string
  isBot: boolean
  color: Color
}

export interface Player extends MenuPlayer {
  score: number
  peasantsCount: number
  playerIndex: number
}

export interface GameState {
  gameID: string
  activePlayerIndex: number
  zones: Zones
  potentialZones: Set<number>
  cardPool: InGameCard[]
  players: Player[]
}
