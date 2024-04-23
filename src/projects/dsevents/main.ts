export class Logger {
  private readonly listElement: HTMLElement

  constructor(rootElement: HTMLElement) {
    this.listElement = makeList()
    appendListToElement(rootElement, this.listElement)
  }

  l = (m: string) => {
    appendListElement(this.listElement, this.makeListElement(m))
  }

  i = (m: string) => {
    appendListElement(this.listElement, this.makeListElement(m))
  }

  e = (m: string) => {
    appendListElement(this.listElement, this.makeListElement(m))
  }

  private makeListElement = (message: string) => {
    let e = document.createElement('span')
    e.textContent = message
    return e
  }
}

function appendListToElement(e: HTMLElement, list: HTMLElement) {
  e.appendChild(list)
}

function makeList(root = document): HTMLElement {
  let e = root.createElement('div')
  let l = root.createElement('ul')
  e.appendChild(l)
  return e
}

function appendListElement(list: HTMLElement, element: HTMLElement) {
  let li = document.createElement('li')
  li.appendChild(element)
  list.appendChild(li)
}
