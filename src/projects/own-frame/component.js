import { scheduleUpdate } from './reconciler.js'

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

export function createInstance(fiber) {
  let instance = new fiber.type(fiber.props)
  instance.__fiber = fiber
  return isntance
}
