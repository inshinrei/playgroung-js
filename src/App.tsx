import { useState } from 'react'
import { atom } from 'nanostores'

const $list = atom([])

function addItem(item) {
  $list.set([...$list.get(), item])
}

function App() {
  const [count, setCount] = useState(0)

  return <div className="App"></div>
}

export default App
