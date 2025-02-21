export let TEXT_ELEMENT = 'TEXT_ELEMENT'

export function createElement(type: any, config: any, ...args: any[]) {
  let props = Object.assign({}, config)
  let hasChildren = args.length > 0
  let rawChildren = hasChildren ? [].concat(...args) : []
  props.children = rawChildren
    .filter((c: any) => c !== null && c !== false)
    .map((c: any) => (c instanceof Object ? c : createTextElement(c)))
  return { type, props }
}

function createTextElement(value: string) {
  return createElement(TEXT_ELEMENT, { nodeValue: value })
}
