import { NetworkOptions } from './types'

export type NetworkMessageCallback = (info: { from: string; to: string; message: string }) => void

export class Network {
  private communicationMatrix = new Map<string, NetworkMessageCallback>()
  private networkOptions: NetworkOptions

  public constructor({ networkOptions }: { networkOptions: NetworkOptions }) {
    this.networkOptions = networkOptions
  }

  public applyOptions(networkOptions: NetworkOptions): void {
    this.networkOptions = networkOptions
  }

  public addNewMessagesListener(nodeName: string, callback: NetworkMessageCallback): void {
    this.communicationMatrix.set(nodeName, callback)
  }

  public sendMessage(info: { from: string; destination: string; message: string }): void {
    console.log('send, ', info)
  }
}
