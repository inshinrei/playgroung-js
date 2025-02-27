import { scheduleUpdate } from './reconciler'

export class Component {
  props
  state

  constructor(props) {
    this.props = props || {}
    this.state ||= {}
  }

  setState(partialState) {
    scheduleUpdate(this, partialState)
  }
}

export function createInstance(fiber) {}
