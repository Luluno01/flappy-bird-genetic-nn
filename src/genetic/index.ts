import { flipBitForBuffer, getBitFromByte, setBitForByte } from '../helpers/bit'
import randint from '../helpers/random'
import range from '../helpers/range'
import Buffer from '../helpers/Buffer'


export abstract class GeneAdapter<T> {
  public abstract get(individual: T): Buffer
  public abstract create(childGene: Buffer, parents: T[]): T
}

export class Genetic<T> {
  public adapter: GeneAdapter<T>
  constructor(adapter: GeneAdapter<T>) {
    this.adapter = adapter
  }

  public crossover(parents: T[]): T {
    const { adapter } = this
    const geneParents = parents.map(parent => adapter.get(parent))
    const numParents = geneParents.length
    const bytes = geneParents[0].length
    const geneChild = Buffer.alloc(bytes)
    for (const byteIndex of range(bytes)) {
      let byte = 0x00
      for (const bitIndex of range(8)) {
        const winner = geneParents[randint(0, numParents)]
        byte = setBitForByte(byte, bitIndex, getBitFromByte(winner.readUInt8(byteIndex), bitIndex))
        // byte &= getBitFromByte(winner[byteIndex], bitIndex) << (8 - bitIndex - 1)
        // byte &= getBitFromBuffer(winner, byteIndex * 8 + bitIndex) << (8 - bitIndex - 1)
      }
      geneChild.writeUInt8(byte, byteIndex)
    }
    // console.log('[genetic.Genetic] Generated', geneChild.toString(), 'from parents', geneParents.map(gp => gp.toString()))
    return adapter.create(geneChild, parents)
  }

  public mutate(individual: T, possibility: number): T {
    const { adapter } = this
    const gene = adapter.get(individual)
    // const before = gene.toString()
    for (const bitIndex of range(gene.length * 8)) {
      if (Math.random() < possibility) {
        flipBitForBuffer(gene, bitIndex)
      }
    }
    // console.log('[genetic.Genetic] Mutated', before, gene.toString())
    return adapter.create(gene, [ individual ])
  }
}

export default Genetic
