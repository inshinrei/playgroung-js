export function updateDomProperties(dom: any, prevProps: any, nextProps: any) {
  let isEvent = (name: string) => name.startsWith('on')
  let isAttribute = (name: string) => !isEvent(name) && name !== 'children'
  Object.keys(prevProps).forEach((name) => {
    let type = name.toLowerCase().substring(2)
    dom.removeEventListener(type, prevProps[name])
  })
  Object.keys(prevProps).forEach((name) => {
    dom[name] = null
  })
  Object.keys(nextProps).forEach((name) => {
    dom[name] = nextProps[name]
  })
  Object.keys(nextProps).forEach((name) => {
    let type = name.toLowerCase().substring(2)
    dom.addEventListener(type, nextProps[name])
  })
}
