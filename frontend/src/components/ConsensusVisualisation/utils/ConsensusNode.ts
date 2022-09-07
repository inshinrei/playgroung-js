import type { NetworkInterface } from './NetworkInterface'

export class ConsensusNode {
  public readonly nodeName: string
  private readonly networkInterface: NetworkInterface

  constructor({
    nodeName,
    networkInterface,
  }: {
    nodeName: string
    networkInterface: NetworkInterface
  }) {
    this.nodeName = nodeName
    this.networkInterface = networkInterface
  }
}
