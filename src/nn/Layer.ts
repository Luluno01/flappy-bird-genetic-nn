import Neuron, { Activator } from './Neuron'


export class Layer {
  protected neurons: Neuron[]
  protected input: Layer | null
  public get size() {
    return this.neurons.length
  }
  constructor(neurons: number, input: Layer | null, activator: Activator, weightInit: (i: number, j: number) => number = () => 0, biasInit: (i: number, j: number) => number = () => 0) {
    if (neurons <= 0) throw new Error('Invalid number of neurons')
    this.input = input
    const ns: Neuron[] = this.neurons = new Array(neurons)
    for (let i = 0; i < neurons; i++) ns[i] = new Neuron(i, input, activator, weightInit, biasInit)
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
