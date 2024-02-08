import type { Player } from 'entities'
import { action, makeObservable, observable } from 'mobx'

export class PlayerStore implements Player {
  public x = 0
  public y = 0
  public hp = 3

  constructor() {
    makeObservable(this, {
      x: observable.shallow,
      y: observable.shallow,
      hp: observable.shallow,
      move: action,
      hit: action,
    })
  }

  public move = (x: number, y: number): void => {
    this.x = x
    this.y = y
  }

  public hit = (damage: number): void => {
    this.hp -= damage
  }
}
