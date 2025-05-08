import React from 'react'

function useStateRef(value) {
  const ref = React.useRef()
  ref.current = value
  console.debug('useStateRef run')
  return ref
}

function App() {
  const ref = useStateRef({ value: 0 })
  const [state, setState] = React.useState(0)

  console.debug(state, ref.current)

  return (
    <div>
      <div
        onClick={() => {
          setState((prevState) => prevState + 1)
          ref.current.value += 1
        }}
      >
        click
      </div>
    </div>
  )
}

export default App
