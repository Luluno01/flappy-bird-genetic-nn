import { flipBitForBuffer, getBitFromByte, setBitForByte } from '../helpers/bit'
import randint from '../helpers/random'
import range from '../helpers/range'
import Buffer from '../helpers/Buffer'
import zip from '../helpers/zip'


export abstract class GeneAdapter<T, G=Buffer> {
  public abstract get(individual: T): G
  public abstract create(childGene: G, parents: T[]): T
}

export abstract class Genetic<T, G=Buffer> {
  public adapter: GeneAdapter<T, G>
  constructor(adapter: GeneAdapter<T, G>) {
    this.adapter = adapter
  }

  public abstract crossover(parents: T[]): T
  public abstract mutate(individual: T, possibility: number): T
}

export class BinaryGenetic<T> extends Genetic<T> {
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
    console.log('[genetic.BinaryGenetic] Generated', geneChild.toString(), 'from parents', geneParents.map(gp => gp.toString()))
    return adapter.create(geneChild, parents)
  }

  public mutate(individual: T, possibility: number): T {
    const { adapter } = this
    const gene = adapter.get(individual)
    const before = gene.toString()
    for (const bitIndex of range(gene.length * 8)) {
      if (Math.random() < possibility) {
        flipBitForBuffer(gene, bitIndex)
      }
    }
    console.log('[genetic.BinaryGenetic] Mutated', before, gene.toString())
    return adapter.create(gene, [ individual ])
  }
}

export default BinaryGenetic

export class AtomGenetic<T, A> extends Genetic<T, A[]> {
  public getAtom: () => A
  constructor(adapter: GeneAdapter<T, A[]>, getAtom: () => A) {
    super(adapter)
    this.getAtom = getAtom
  }

  public crossover(parents: T[]): T {
    const { adapter } = this
    const geneParents = parents.map(parent => adapter.get(parent))
    const numParents = geneParents.length
    const geneChild: A[] = []
    for (const atoms of zip<A>(...geneParents)) {
      const pickedAtom = atoms[randint(0, numParents)]
      geneChild.push(pickedAtom)
    }
    console.log(`[genetic.AtomGenetic] Parent (sample out of ${numParents})`, geneParents[0].slice(0, 4), 'child (sample)', geneChild.slice(0, 4))
    return adapter.create(geneChild, parents)
  }

  public mutate(individual: T, possibility: number): T {
    const { adapter, getAtom } = this
    const gene = adapter.get(individual)
    const geneChild = gene.map(atom => Math.random() < possibility ? getAtom() : atom)
    console.log(`[genetic.AtomGenetic] Original (sample)`, gene.slice(0, 4), 'mutated (sample)', geneChild.slice(0, 4))
    return adapter.create(geneChild, [ individual ])
  }
}
