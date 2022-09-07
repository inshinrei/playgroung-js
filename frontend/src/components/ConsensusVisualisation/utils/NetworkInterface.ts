import { Network } from './Network'

export type MessageCallback = (from: string, message: string) => void

export class NetworkInterface {
  private network: Network
  private nodeName: string
  private newMessagesCallback?: MessageCallback

  constructor(network: Network, nodeName: string) {
    this.network = network
    this.nodeName = nodeName

    this.network.addNewMessagesListener(this.nodeName, ({ from, message }) => {
      this.newMessagesCallback?.(from, message)
    })
  }

  public sendMessage(destination: string, message: string): void {
    this.network.sendMessage({
      from: this.nodeName,
      destination,
      message,
    })
  }

  public setNewMessagesListener(callback: MessageCallback): void {
    this.newMessagesCallback = callback
  }
}
