import range from '../helpers/range'
import Layer from './Layer'


export type Activator = (this: Neuron, sum: number, i: number) => number

/**
 * A neuron has multiple input values from previous layer and one unweighted, unbiased output value to next layer
 */
export class Neuron {
  public static Sigmoid: Activator = (sum: number) => 1 / (1 + Math.exp(-sum))
  public static ReLU: Activator = (sum: number) => Math.max(0, sum)

  public index: number
  public weights?: number[]
  public biases?: number[]
  public activator: Activator
  /**
   * 
   * @param index index of this neuron in a layer
   * @param input input layer, null if this is a neuron of the input layer
   * @param activator activation function
   * @param weightInit initializer of weights
   * @param biasInit initializer of biases
   */
  constructor(index: number, input: Layer | null, activator: Activator, weightInit?: (i: number, j: number) => number, biasInit?: (i: number, j: number) => number)
  /**
   * 
   * @param neuron another neuron to copy from
   */
  constructor(neuron: Neuron)
  constructor(indexOrNeuron: number | Neuron, input?: Layer | null, activator?: Activator, weightInit: (i: number, j: number) => number = () => 0, biasInit: (i: number, j: number) => number = () => 0) {
    if (typeof indexOrNeuron == 'number') {
      this.index = indexOrNeuron
      this.activator = activator!!
      if (input) {
        const inputSize = input.size
        const ws = this.weights = new Array(inputSize)
        const bs = this.biases = new Array(inputSize)
        for (const j of range(inputSize)) {
          ws[j] = weightInit(indexOrNeuron, j)
          bs[j] = biasInit(indexOrNeuron, j)
        }
      }
    } else {
      const { index, weights, biases, activator: act } = indexOrNeuron
      this.index = index
      if (weights) this.weights = Array.from(weights)
      if (biases) this.biases = Array.from(biases)
      this.activator = act
    }
  }

  public clone() {
    return new Neuron(this)
  }

  /**
   * Get the activation value of this neuron
   * @param inputs unweighted, unbiased inputs from previous layer, or raw input
   */
  public activate(inputs: number[] | number) {
    const { weights, biases, index } = this
    if (weights && biases) {
      if (!(inputs instanceof Array)) throw new Error('Expecting an array of activation values')
      if (weights.length != biases.length) throw new Error('Broken neuron with mismatched weights length and biases length')
      if (inputs.length != weights.length) throw new Error('Unmatched input size')
      let sum = 0
      let i = 0
      for (const iAct of inputs) {
        sum += iAct * weights[i] + biases[i]
        i++
      }
      return this.activator(sum, index)
    } else {
      if (typeof inputs != 'number') throw new Error('Expecting a number because this is a neuron of an input layer')
      return this.activator(inputs, index)
    }
  }
}

export default Neuron
