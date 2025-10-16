export function main() {
  let subject = Array.from({ length: 20_000 }).fill({ prop: 'value' })

  let t1 = performance.now()
  for (let i of subject) {
    run(i)
  }

  console.log(performance.now() - t1)
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
