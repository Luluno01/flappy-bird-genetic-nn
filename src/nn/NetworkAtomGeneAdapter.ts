import { GeneAdapter } from '../genetic'
import Network from './Network'
import Buffer from '../helpers/Buffer'
import zip from '../helpers/zip'
import enumerate from '../helpers/enumerate'


export interface NetworkGeneAtom {
  weight: number
  bias: number
}

function *walkNetworkGeneAtom(network: Network): Generator<NetworkGeneAtom> {
  for (const layer of network.layers) {
    for (const { weights, biases } of layer.getNeurons()) {
      if (weights && biases) {
        for (const [ weight, bias ] of zip(weights, biases)) yield { weight, bias }
      }
    }
  }
}

export class NetworkAtomGeneAdapter extends GeneAdapter<Network, NetworkGeneAtom[]> {
  public get(individual: Network): NetworkGeneAtom[] {
    return Array.from(walkNetworkGeneAtom(individual))
  }

  public create(gene: NetworkGeneAtom[], [ parent ]: Network[]): Network {
    const child = parent.clone()
    const { layers } = child
    let cursor = 0
    for (const layer of layers) {
      for (const { weights, biases } of layer.getNeurons()) {
        if (weights && biases) {
          for (const i of weights) {
            const { weight, bias } = gene[cursor++]
            weights[i] = weight
            biases[i] = bias
          }
        }
      }
    }
    return child
  }
}

export default NetworkAtomGeneAdapter
