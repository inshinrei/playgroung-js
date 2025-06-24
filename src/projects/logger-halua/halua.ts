// {time} {level} msg
// invoke .info(msg, ...args) where args = name follow by value
enum Level {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warning = 'WARN',
  Error = 'ERR',
}

let defaultDriver = self.console

class CoreLogger {
  private driver

  constructor() {
    this.driver = defaultDriver
  }

  info(msg: string): void {
    this.driver.log(msg)
  }

  debug(msg: string, ...args: any): void {
    let result = msg
    if (args.length === 1) {
      result = result + ' ' + args[0]
    } else {
      let d = ''
      for (let arg of args) {
        if (d) {
          d += `"${arg}"`
          result = this.shift(d, result)
          d = ''
        } else {
          d = `${arg}=`
        }
      }
      if (args.length % 2 !== 0) {
        result = this.shift(d, result)
      }
    }
    result = this.shift(Level.Debug, result)
    result = this.shift(
      new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      result,
    )

    console.debug(args)

    this.driver.debug(result)
  }

  public With() {}

  public New() {}

  private shift(value: string, msg: string) {
    return value + ' ' + msg
  }
}

export const halua = new CoreLogger()
