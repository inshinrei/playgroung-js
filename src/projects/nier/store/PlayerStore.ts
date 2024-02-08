import type { Player } from 'entities'
import type { Root } from './RootStore'
import { makeObservable } from 'mobx'

export class PlayerStore implements Player {
  x = 0
  y = 0

  constructor(rootStore: Root) {
    makeObservable(this)
  }
}
