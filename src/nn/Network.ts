import Layer from './Layer'
import { Activator } from './Neuron'


export class Network {
  public layers: Layer[] = []

  public newLayer(neurons: number, activator: Activator, weightInit: (i: number, j: number) => number = () => 0, biasInit: (i: number, j: number) => number = () => 0) {
    const { layers } = this
    const lastLayer: Layer | null = layers[layers.length - 1] || null
    const layer = new Layer(neurons, lastLayer, activator, weightInit, biasInit)
    layers.push(layer)
    return layer
  }

  public activate(inputs: number[]) {
    const { layers } = this
    let activations: number[] = inputs
    for (const layer of layers) {
      activations = layer.activate(activations)
    }
    return activations
  }

  public clone() {
    const network = new Network
    let lastLayer: Layer | null = null
    for (const layer of this.layers) {
      network.layers.push(layer.clone(lastLayer))
      if (!lastLayer) lastLayer = layer
    }
    return network
  }
}

export default Network
