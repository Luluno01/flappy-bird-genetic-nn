<template>
  <canvas ref="canvas" width="288" height="512"></canvas>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref, ToRefs } from 'vue'
import Engine2D from './engine'
import Entity from './engine/objects/Entity'
import { waitImage } from './engine/Resource'
import Network from './nn/Network'
import Neuron from './nn/Neuron'
import Game from './game/Game'
import Pipe from './game/entities/Pipe'
import Background from './game/entities/Background'
import Ground from './game/entities/Ground'
import CheatingControl from './controls/CheatingControl'
import RandomControl from './controls/RandomControl'


export default defineComponent({
  name: 'App',
  setup() {
    const network = new Network
    function randWeight() {
      return (Math.random() > 0.5 ? 1 : -1) * Math.random()
    }
    function randBias() {
      return (Math.random() > 0.5 ? 1 : -1) * Math.random()
    }
    network.newLayer(3, Neuron.ReLU, randWeight, randBias)
    network.newLayer(7, Neuron.ReLU, randWeight, randBias)
    network.newLayer(1, Neuron.Sigmoid, randWeight, randBias)
    console.log(network.activate([ 1, 1, 1 ]))

    const canvas = ref<HTMLCanvasElement>(null as any)

    onMounted(async () => {
      await Promise.all([
        waitImage(Pipe.pipeNorthImg),
        waitImage(Pipe.pipeSouthImg),
        waitImage(Background.bgImg),
        waitImage(Ground.fgImg)
      ])
      console.log('[App] Images loaded')
      const game = new Game
      game.mount(canvas.value)
      game.addBird(new CheatingControl)
      game.addBird(new CheatingControl)
      game.addBird(new CheatingControl)
      game.addBird(new RandomControl)
      game.addBird(new RandomControl)
      game.addBird(new RandomControl)
      game.run()
    })
    return {
      canvas
    }
  }
})
</script>
