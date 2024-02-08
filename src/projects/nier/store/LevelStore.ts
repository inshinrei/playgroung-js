import type { Level } from 'entities'
import { makeObservable, observable } from 'mobx'

export class LevelStore implements Level {
  public ground = [0, 0, 0, 0]
  public partitions = []

  constructor() {
    makeObservable(this, {
      ground: observable.shallow,
      partitions: observable.shallow,
    })
    this.generate()
  }

  generate = (): void => {}
}
