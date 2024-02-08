declare module 'entities' {
  export interface Player {
    x: number
    y: number
    hp: number
    move: (x: number, y: number) => void
    hit: (damage: number) => void
  }

  export interface Level {
    ground: Array<number, number, number, number>
    partitions: Array<Partition>
    generate: () => void
  }

  export interface Partition {
    hp: number
    x1: number
    y1: number
    x2: number
    y2: number
    hit: (damage: number) => void
  }

  export interface Projectile {
    x: number
    y: number
    velocity: number
    damage: number
    move: (x: number, y: number) => void
  }
}
