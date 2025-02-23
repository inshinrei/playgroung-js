function isEvent(name) {
  return name.startsWith('on')
}

function isAttribute(name) {
  return !isEvent(name) && name !== 'children' && name !== 'style'
}

function isNew(prev, next) {
  return (key) => prev[key] !== next[key]
}

function isGone(_, next) {
  return (key) => !(key in next)
}

export function updateDomProperties(dom: any, prevProps: any, nextProps: any) {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      let type = name.toLowerCase().substring(2)
      dom.removEventListener(type, prevProps[name])
    })
  Object.keys(prevProps)
    .filter(isAttribute)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = null
    })
  Object.keys(nextProps)
    .filter(isAttribute)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name]
    })
  prevProps.style = prevProps.style || {}
  nextProps.style = nextProps.style || {}
  Object.keys(nextProps.style)
    .filter(isNew(prevProps.style, nextProps.style))
    .forEach((name) => {
      dom.style[name] = nextProps.style[name]
    })
  Object.keys(prevProps.style)
  Object.keys(nextProps).forEach((name) => {
    let type = name.toLowerCase().substring(2)
    dom.addEventListener(type, nextProps[name])
  })
}
