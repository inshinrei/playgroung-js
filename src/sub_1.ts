export function main() {
  const obj = { prop: 'value', prop1: 'v1' }
  let g = unpack(obj)
  delete obj.prop
  console.log(g.next().value)
}

function run(...args: any[]) {
  let g = unpack(...args)
  while (true) {
    let r = g.next()
    if (r.done) {
      break
    }
    console.log(r.value)
  }
}

function* unpack(...args: any[]) {
  for (let v of args) {
    yield v
  }
}
