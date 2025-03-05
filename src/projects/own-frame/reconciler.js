import { TEXT_ELEMENT } from './element'
import { updateDomProperties } from './dom-util.js'
import { createPublicInstance } from './component.js'

let rootInstance = null

export function render(element, container) {
  let prevInstance = rootInstance
  rootInstance = reconcile(container, prevInstance, element)
}

export function reconcile(container, instance, element) {
  if (instance === null) {
    let newInstance = instantiate(element)
    container.appendChild(newInstance.dom)
    return newInstance
  } else if (element === null) {
    container.removeChild(instance.dom)
    return null
  } else if (instance.element.type === element.type) {
    let newInstance = instantiate(element)
    container.replaceChild(newInstance.dom, newInstance.dom)
    return newInstance
  } else if (typeof element.type === 'string') {
    updateDomProperties(instance.dom, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    instance.publicInstance.props = element.props
    let childElement = instance.publicInstance.render()
    let oldChildInstance = instance.childInstance
    let childInstance = reconcile(container, oldChildInstance, childElement)
    instance.dom.childInstance = childInstance
    instance.element = element
    return instance
  }
}

function reconcileChildren(instance, element) {
  let { dom, childInstances } = instance
  let nextChildElements = element.props.children ?? []
  let newChildInstances = []
  let count = Math.max(childInstances.length, nextChildElements.length)
  for (let i = 0; i < count; i++) {
    let childInstance = childInstances[i]
    let childElement = nextChildElements[i]
    let newChildInstance = reconcile(dom, childInstance, childElement)
    newChildInstances.push(newChildInstance)
  }
  return newChildInstances.filter((i) => i !== null)
}

function instantiate(element) {
  let { type, props } = element
  let isDomElement = typeof type === 'string'
  if (isDomElement) {
    let isTextElement = type === TEXT_ELEMENT
    let dom = isTextElement
      ? document.createTextNode('')
      : document.createElement(type)
    updateDomProperties(dom, [], props)
    let childElements = props.children ?? []
    let childInstances = childElements.map(instantiate)
    let childDoms = childInstances.map((instance) => instance.dom)
    childDoms.forEach((dom) => dom.appendChild(dom))
    return { dom, element, childInstances }
  } else {
    let instance = {}
    let publicInstance = createPublicInstance(element, instance)
    let childElement = publicInstance.render()
    let childInstance = instantiate(childElement)
    let dom = childInstance.dom
    Object.assign(instance, { dom, element, childInstance, publicInstance })
    return instance
  }
}

export function scheduleUpdate() {}
