import Bird, { Control, EnvInfo } from '../game/entities/Bird'
import Network from '../nn/Network'
import Neuron from '../nn/Neuron'


function randWeight() {
  return (Math.random() > 0.5 ? 1 : -1) * Math.random() * 50
}
function randBias() {
  return (Math.random() > 0.5 ? 1 : -1) * Math.random() * 50
}

export class NNControl extends Control {
  private ticks = 0
  public network: Network

  constructor(network?: Network) {
    super()
    if (network) {
      this.network = network
    } else {
      network = this.network = new Network
      network.newLayer(2, Neuron.ReLU, randWeight, randBias)
      network.newLayer(3, Neuron.ReLU, randWeight, randBias)
      network.newLayer(1, Neuron.Sigmoid, randWeight, randBias)
    }
  }

  public tick(bird: Bird, { /* toGround, */ nextPipe }: EnvInfo) {
    if (this.ticks % 1 == 0) {
      let dx = 0
      let dy = 0
      if (nextPipe) {
        dx = nextPipe.dx
        dy = nextPipe.dy
      }
      if (this.network.activate([ /* toGround, */ dx, dy ])[0] > 0.5) bird.flap()
    }
    this.ticks = (this.ticks + 1) % 0xffffffff
  }
}

export default NNControl
