import { scheduleUpdate } from './reconciler'

export class Component<S = any, P = any> {
  props: P
  state: S

  constructor(props: P) {
    this.props = props || {}
    this.state ||= {}
  }

  setState(partialState: any) {
    scheduleUpdate(this, partialState)
  }
}

export function createInstance(fiber) {}
