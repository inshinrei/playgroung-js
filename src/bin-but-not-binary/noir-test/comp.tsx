import { Component, createRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

export function SomeComponent() {
  const [state, setState] = useState(false)

  function onClick() {
    setState((v) => !v)
  }

  return (
    <div>
      <SwipeComponent>
        {state ? <YellowBlock /> : <BlackBlock />}
      </SwipeComponent>
      <button onClick={onClick}>Change</button>
    </div>
  )
}

class SwipeComponent extends Component {
  ref = createRef(null)

  pendingSwipe = false
  elem = null

  constructor(props) {
    super(props)

    this.state = {
      nextChildren: null,
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.debug(nextProps, nextState)
    console.debug(this.props, this.state)
    if (this.pendingSwipe) {
      return false
    }
    if (
      this.props.children.type !== nextProps.children.type &&
      !this.state.nextChildren &&
      this.ref?.current
    ) {
      this.setState({ nextChildren: nextProps.children })
      this.pendingSwipe = true
      const elem = document.createElement('div')
      this.elem = elem
      console.debug(this.ref.current.clientWidth)
      elem.style.position = 'absolute'
      elem.style.left = this.ref.current.clientWidth + 'px'
      console.debug('appending child')
      this.ref.current.appendChild(elem)
      const root = createRoot(elem)
      root.render(nextProps.children)
      this.ref.current.style.transition = 'all .5s ease-in-out'
      this.ref.current.style.transform = `translateX(-300px)`
    }

    return true
  }

  render() {
    return (
      <div
        ref={this.ref}
        style={{
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          transition: 'all .5s ease-in-out',
        }}
        onTransitionEnd={() => {
          this.pendingSwipe = false
          this.elem.remove()
          this.ref.current.style.transition = 'opacity .3s ease-in-out'
          this.ref.current.style.transform = ''
          this.elem = null
          this.setState({ nextChildren: null })
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

function YellowBlock() {
  return (
    <div
      style={{ backgroundColor: 'yellow', width: '300px', height: '700px' }}
    />
  )
}

function BlackBlock() {
  return (
    <div
      style={{ backgroundColor: 'black', width: '300px', height: '700px' }}
    />
  )
}
