interface Shape {
  x: number
  y: number
  w: number
  h: number
}

class WindowManager {
  private windows
  private count: number
  private id: number
  private data
  private shapeChangeCb
  private changeCb

  constructor() {
    let that = this
    addEventListener('storage', (e) => {
      if (e.key === 'windows') {
        let newWindows = JSON.parse(e.newValue)
        let changed = that.didWindowsChange(that.windows, newWindows)
        that.windows = newWindows
        if (changed) {
          if (typeof that.changeCb === 'function') {
            that.changeCb()
          }
        }
      }
    })
    window.addEventListener('beforeunload', () => {
      let index = that.getWindowIndexFromId(that.id)
      that.windows.splice(index, 1)
      that.updateWindows()
    })
  }

  private didWindowsChange(p, n) {
    if (p.length !== n.length) {
      return true
    } else {
      let c = false
      for (let i = 0; i < p.length; i++) {
        if (p[i].id !== n[i].id) {
          c = true
          break
        }
      }
      return c
    }
  }

  init(meta) {
    this.windows = JSON.parse(localStorage.getItem('windows') ?? '') ?? []
    this.count = localStorage.getItem('count') ?? 0
    this.count++

    this.id = this.count
    let shape = this.getShape()
    this.data = { id: this.id, shape, meta }
    this.windows.push(this.data)
    localStorage.setItem('count', this.count)
    this.updateWindows()
  }

  getShape(): Shape {
    return {
      x: window.screenLeft,
      y: window.screenTop,
      w: window.innerWidth,
      h: window.innerHeight,
    }
  }

  getWindowIndexFromId(id: number) {
    let index = -1
    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].id === id) {
        index = i
        break
      }
    }
    return index
  }

  updateWindows() {
    localStorage.setItem('windows', JSON.stringify(this.windows))
  }

  shapeIsNotTheSame(shape: Shape) {
    return (
      shape.x !== this.data.shape.x ||
      shape.y !== this.data.shape.y ||
      shape.w !== this.data.shape.w ||
      shape.h !== this.data.shape.h
    )
  }

  update() {
    let shape = this.getShape()
    if (this.shapeIsNotTheSame(shape)) {
      this.data.shape = shape
      let index = this.getWindowIndexFromId(this.id)
      this.windows[index].shape = shape
      if (typeof this.shapeChangeCb === 'function') {
        this.shapeChangeCb()
      }
      this.updateWindows()
    }
  }

  setShapeChangeCb(callback: Function) {
    this.shapeChangeCb = callback
  }

  setChangeCb(callback: Function) {
    this.changeCb = callback
  }

  get windowsData() {
    return this.windows
  }
}

export default WindowManager
