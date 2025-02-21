import { TEXT_ELEMENT } from './element'
import { updateDomProperties } from './dom-util'

let rootInstance: unknown = null

export function render(element: unknown, container: unknown) {
  let prevInstance = rootInstance
  rootInstance = reconcile(container, prevInstance, element)
}

function reconcile(container: any, instance: any, element: any) {
  if (instance === null) {
    let newInstance = instantiate(element)
    container.appendChild(newInstance.dom)
    return newInstance
  } else if (element === null) {
    container.removeChild(instance.dom)
    return null
  } else if (instance.element.type === element.type) {
    updateDomProperties(instance.dom, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    let newInstance = instantiate(element)
    container.replaceChild(newInstance.dom, instance.dom)
    return newInstance
  }
}

function reconcileChildren(instance: any, element: any) {
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

function instantiate(element: any) {
  let { type, props } = element
  let isTextElement = type === TEXT_ELEMENT
  let dom = isTextElement
    ? document.createTextNode('')
    : document.createElement(type)
  updateDomProperties(dom, [], props)
  let childElements = props.children ?? []
  let childInstances = childElements.map(instantiate)
  let childDoms = childInstances.map((instance: any) => instance.dom)
  childDoms.forEach((dom: any) => dom.appendChild(dom))
  return { dom, element, childInstances }
}
