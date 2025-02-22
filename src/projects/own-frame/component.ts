import { reconcile } from './reconciler'

export class Component<S = any, P = any> {
  props: P
  state: S

  constructor(props: P) {
    this.props = props
    this.state ||= {}
  }

  setState(partialState: any) {
    this.state = Object.assign({}, this.state, partialState)
    updateInstance(this.__internalInstance)
  }
}

function updateInstance(instance) {
  let container = instance.dom.parentNode
  let element = instance.element
  reconcile(container, instance, element)
}

export function createPublicInstance(element, instance) {
  let { type, props } = element
  let publicInstance = new type(props)
  publicInstance.__internalInstance = instance
  return publicInstance
}
