<template>
  <canvas ref="canvas" width="288" height="512"></canvas>
  <div>TPS: {{ tps }}</div>
  <div>Gen: {{ generations }}</div>
  <div>Max Score: {{ maxScore }}</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, Ref, nextTick } from 'vue'
import Engine2D from './engine'
import Entity from './engine/objects/Entity'
import { waitImage } from './engine/Resource'
import Game from './game/Game'
import Pipe from './game/entities/Pipe'
import Background from './game/entities/Background'
import Ground from './game/entities/Ground'
import CheatingControl from './controls/CheatingControl'
import RandomControl from './controls/RandomControl'
import NNControl from './controls/NNControl'
import Genetic from './genetic'
import Network from './nn/Network'
import NetworkGeneAdapter from './nn/NetworkGeneAdapter'
import range from './helpers/range'


export default defineComponent({
  name: 'App',
  setup() {
    const generations = ref(1)
    const maxScore = ref(0)
    class GeneticGame extends Game {
      public maxBirds = 16
      public parents = 8
      public mutationRate = 0.2
      protected genetic = new Genetic<Network>(new NetworkGeneAdapter)
      public onGameOver() {
        const { birds, genetic } = this
        const sortedBirds = birds.sort((a, b) => {
          if (b.score == a.score) return b.aliveTicks - a.aliveTicks
          else return b.score - a.score
        })
        maxScore.value = sortedBirds[0].score
        console.log('[App] Alive ticks', birds.map(bird => bird.aliveTicks))
        const parentBirds = sortedBirds.slice(0, this.parents)
        const nextGenInfo: { network: Network, score: number }[] = []
        const parents: Network[] = []
        for (const { control, score } of parentBirds) {
          const network = (control as NNControl).network
          parents.push(network)
          nextGenInfo.push({
            network,
            score
          })
        }

        for (const _ of range(this.maxBirds - this.parents)) {
          const child = genetic.mutate(genetic.crossover(parents), this.mutationRate)
          nextGenInfo.push({ network: child, score: 0 })
        }

        this.reset()
        if (this.engine.paused) this.unpause()
        nextTick(() => {
          for (const { network, score } of nextGenInfo) {
            const bird = this.addBird(new NNControl(network))
            bird.score = score
          }
          generations.value++
        })
      }

      public run() {
        for (const _ of range(this.maxBirds)) this.addBird(new NNControl)
        return super.run()
      }
    }

    const canvas = ref<HTMLCanvasElement>(null as any)
    const game = reactive(new GeneticGame)
    const tps = computed(() => game.engine?.tps || 0)

    onMounted(async () => {
      await Promise.all([
        waitImage(Pipe.pipeNorthImg),
        waitImage(Pipe.pipeSouthImg),
        waitImage(Background.bgImg),
        waitImage(Ground.fgImg)
      ])
      console.log('[App] Images loaded')
      game.mount(canvas.value)
      // game.addBird(new CheatingControl)
      // game.addBird(new CheatingControl)
      // game.addBird(new CheatingControl)
      // game.addBird(new RandomControl)
      // game.addBird(new RandomControl)
      // game.addBird(new RandomControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      // game.addBird(new NNControl)
      game.run()
    })
    return {
      canvas,
      game,
      tps,
      generations,
      maxScore
    }
  }
})
</script>
