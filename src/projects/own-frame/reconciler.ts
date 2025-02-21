import { TEXT_ELEMENT } from './element'

let rootInstance: unknown = null

export function render(element: unknown, container: unknown) {
  let prevInstance = rootInstance
  let nextInstance = reconcile(container, prevInstance, element)
  rootInstance = nextInstance
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
  let isListener = (name: string) => name.startsWith('on')
  Object.keys(props)
    .filter(isListener)
    .forEach((name) => {
      let eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, props[name])
    })
  let isAttribute = (name: string) => !isListener(name) && name !== 'children'
  Object.keys(props)
    .filter(isAttribute)
    .forEach((name) => {
      dom[name] = props[name]
    })
  let childElements = props.children ?? []
  let childInstances = childElements.map(instantiate)
  let childDoms = childInstances.map((instance: any) => instance.dom)
  childDoms.forEach((dom: any) => dom.appendChild(dom))
  const instance = { dom, element, childInstances }
  return instance
}
