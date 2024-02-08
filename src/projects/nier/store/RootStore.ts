import type { Player } from 'entities'
import { PlayerStore } from './PlayerStore'

export interface Root {
  playerStore: Player
}

class RootStore implements Root {
  playerStore: Player

  constructor() {
    this.playerStore = new PlayerStore()
  }
}

export default new RootStore()
