export let TEXT_ELEMENT = 'TEXT_ELEMENT'

export function createElement(type, config, ...args) {
  let props = Object.assign({}, config)
  let hasChildren = args.length > 0
  let rawChildren = hasChildren ? [].concat(...args) : []
  props.children = rawChildren
    .filter((c) => c !== null && c !== false)
    .map((c) => (c instanceof Object ? c : createTextElement(c)))
  return { type, props }
}

function createTextElement(value) {
  return createElement(TEXT_ELEMENT, { nodeValue: value })
}
