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

class Halua {
    constructor(private handlers: Array<any>) {}

    info(...args: any[]) {
        const gen = this.run(...args)
        const gens = []
        for (let h of this.handlers) {
            gens.push(h.execute())
        }
        let v
        let i = 0
        for (let a of args) {
            gens.forEach((g) => {
                const v = g.next({ type: 'arg', value: a })
                console.log('next val', v)
            })
        }
        gens.forEach((g) => g.next({ type: 'done' }))
        console.log('done')
    }

    *run(...args: any[]) {
        while (true) {
            let thing = yield ''
            console.log(thing)
        }
        console.log('returs')
    }
}

class Handler {
    queue = new Set()

    some() {}

    *execute() {
        let arg = { type: 'pass', value: null }
        while (arg.type !== 'done') {
            if (arg.type === 'arg') {
                this.queue.add(arg)
            }
            arg = yield { type: 'next' }
        }
        console.log(this.queue)
    }

    appendArg(arg: any) {
        this.queue.add(arg)
    }

    send() {
        let args = Array.from(this.queue)
        this.queue.clear()
        console.log(...args)
    }
}

class Handler_1 extends Handler {}

class Handler_2 extends Handler {}

const halua = new Halua([new Handler_1(), new Handler_2()])

export function main() {
    halua.info('string', [1, 2, 3])
    halua.info({ prop: 'value' }, 'hello!!!')
}
