import { TEXT_ELEMENT } from './element'

export function render(element, container) {
  let { type, props } = element
  let isTextElement = type === TEXT_ELEMENT
  let dom = isTextElement
    ? document.createTextNode('')
    : document.createElement(type)
  let isListener = (name) => name.startsWith('on')
  Object.keys(props)
    .filter(isListener)
    .forEach((name) => {
      let eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, props[name])
    })
  let isAttribute = (name) => !isListener(name) && name !== 'children'
  Object.keys(props)
    .filter(isAttribute)
    .forEach((name) => {
      dom[name] = props[name]
    })
  let childElements = props.children ?? []
  childElements.forEach((child) => render(child, dom))
  container.appendChild(dom)
}
