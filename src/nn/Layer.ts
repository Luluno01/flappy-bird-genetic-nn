import range from '../helpers/range'
import Neuron, { Activator } from './Neuron'


export class Layer {
  protected neurons: Neuron[]
  protected input: Layer | null
  public get size() {
    return this.neurons.length
  }
  constructor(neurons: number, input: Layer | null, activator: Activator, weightInit?: (i: number, j: number) => number, biasInit?: (i: number, j: number) => number)
  constructor(layer: Layer, newInput: Layer | null)
  constructor(neuronsOrLayer: number | Layer, input: Layer | null, activator?: Activator, weightInit: (i: number, j: number) => number = () => 0, biasInit: (i: number, j: number) => number = () => 0) {
    if (typeof neuronsOrLayer == 'number') {
      if (neuronsOrLayer <= 0) throw new Error('Invalid number of neurons')
      this.input = input
      const ns = this.neurons = new Array(neuronsOrLayer)
      for (const i of range(neuronsOrLayer)) ns[i] = new Neuron(i, input, activator!, weightInit, biasInit)
    } else {
      this.input = input
      this.neurons = neuronsOrLayer.neurons.map(neuron => neuron.clone())
    }
  }

  public clone(newInput: Layer | null) {
    return new Layer(this, newInput)
  }

  public getNeurons() {
    return this.neurons
  }

  public activate(inputs: number[]) {
    const { input, neurons } = this
    if (input) {
      return neurons
        .map(neuron => neuron.activate(inputs))
    } else {
      // This is an input layer
      if (inputs.length != neurons.length) throw new Error('Unmatched number of raw inputs')
      return neurons
        .map((neuron, i) => neuron.activate(inputs[i]))
    }
  }
}

export default Layer
