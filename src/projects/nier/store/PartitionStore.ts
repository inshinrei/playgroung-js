import type { Partition } from 'entities'
import { makeObservable, observable, action } from 'mobx'

export class PartitionStore implements Partition {
  public x1 = 0
  public y1 = 0
  public x2 = 0
  public y2 = 0
  public hp = 5

  constructor() {
    makeObservable(this, {
      x1: observable.shallow,
      y1: observable.shallow,
      x2: observable.shallow,
      y2: observable.shallow,
      hit: action,
    })
  }

  public hit = (damage: number): void => {
    this.hp -= damage
  }
}
