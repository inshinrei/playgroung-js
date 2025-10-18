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
        let v
        let i = 0
        while (!v?.done) {
            v = gen.next(i++)
            if (i === 10) {
                gen.return('string')
            }
        }
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
