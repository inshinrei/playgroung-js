import { Driver, Level, Logger } from './types'

// export not needed
export class LoggerCore implements Logger {
  driver: Driver

  // should pass driver, min level to log
  constructor() {
    // duct
    this.driver = self.console

    // throw error if driver is not full
  }

  public debug(msg: string, ...args: any[]) {
    this.log('debug', msg, ...args)
  }

  public info(msg: string, ...args: any[]) {
    this.log('info', msg, ...args)
  }

  public warn(msg: string, ...args: any[]) {
    this.log('warn', msg, ...args)
  }

  public err(msg: string, ...args: any[]) {
    this.log('error', msg, ...args)
  }

  public assert(value: boolean, msg: string, ...args: any[]) {
    if (!value) {
      this.log('error', `assertion failed: ${msg}`, ...args)
    }
  }

  private log(
    to: 'debug' | 'info' | 'warn' | 'error',
    msg: string,
    ...args: any[]
  ): void {
    let value = msg
    value = this.composeMsgWithArgs(value, ...args)

    // move map to class body
    let level: string = new Map([
      ['debug', Level.Debug],
      ['info', Level.Info],
      ['warn', Level.Warn],
      ['error', Level.Error],
    ]).get(to)!

    value = this.formatWithDate(this.formatWithLevel(level, value))
    this.driver[to](value)
  }

  private composeMsgWithArgs(msg: string, ...args: any[]) {
    if (args.length === 1) {
      return this.appendValue(args[0], msg)
    }

    let totalMsg = msg
    let currKey = ''

    for (let arg of args) {
      if (!currKey) {
        currKey = arg
        continue
      }

      totalMsg = this.appendValue(`${currKey}=${arg}`, totalMsg)
      currKey = ''
    }

    if (currKey) {
      totalMsg = this.appendValue(`${currKey}=${undefined}`, totalMsg)
    }

    return totalMsg
  }

  private formatWithLevel(level: string, msg: string): string {
    return this.shiftValue(level, msg)
  }

  private formatWithDate(msg: string): string {
    return this.shiftValue(this.getDateInLocaleString(), msg)
  }

  private shiftValue(value: string, to: string) {
    return `${value} ${to}`
  }

  private appendValue(value: string, to: string) {
    return `${to} ${value}`
  }

  private getDateInLocaleString(): string {
    let d = new Date()
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
  }
}
