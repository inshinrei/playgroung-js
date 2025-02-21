import { TEXT_ELEMENT } from './element'
import { updateDomProperties } from './dom-util'

let rootInstance: unknown = null

export function render(element: unknown, container: unknown) {
  let prevInstance = rootInstance
  rootInstance = reconcile(container, prevInstance, element)
}

function reconcile(container: any, instance: any, element: unknown) {
  if (instance === null) {
    let newInstance = instantiate(element)
    container.appendChild(newInstance.dom)
    return newInstance
  } else {
    let newInstance = instantiate(element)
    container.replaceChild(newInstance.dom, instance.dom)
    return newInstance
  }
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
