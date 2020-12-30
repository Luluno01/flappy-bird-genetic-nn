import { GeneAdapter } from '../genetic'
import Network from './Network'
import Buffer from '../helpers/Buffer'


export class NetworkGeneAdapter extends GeneAdapter<Network> {
  public get(individual: Network): Buffer {
    let bytes = 0
    for (const layer of individual.layers) {
      for (const { weights } of layer.getNeurons()) {
        if (weights) {
          bytes += weights.length * 2 * 4  // weights & biases
        }
      }
    }
    const gene = Buffer.alloc(bytes)
    let cursor = 0
    for (const layer of individual.layers) {
      for (const { weights, biases } of layer.getNeurons()) {
        if (weights) {
          for (const weight of weights) {
            gene.writeFloatLE(weight, cursor)
            cursor += 4
          }
          for (const bias of biases!) {
            gene.writeFloatLE(bias, cursor)
            cursor += 4
          }
        }
      }
    }
    return gene
  }

  public create(gene: Buffer, [ parent ]: Network[]): Network {
    const child = parent.clone()
    const { layers } = child
    let cursor = 0
    for (const layer of layers) {
      for (const { weights, biases } of layer.getNeurons()) {
        if (weights) {
          weights.forEach((_, i) => {
            weights[i] = gene.readFloatLE(cursor)
            cursor += 4
          })
          biases!.forEach((_, i) => {
            biases![i] = gene.readFloatLE(cursor)
            cursor += 4
          })
        }
      }
    }
    return child
  }
}

export default NetworkGeneAdapter
