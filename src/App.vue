<template>
  <canvas ref="canvas" width="288" height="512"></canvas>
  <div>TPS: {{ tps }}</div>
  <div>Gen: {{ generations }}</div>
  <div>Max Score: {{ maxScore }}</div>
  <button @click="toggleSpeed">Toggle Speed</button>
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
import RandomControl from './controls/RandomControl'
import NNControl from './controls/NNControl'
import { BinaryGenetic } from './genetic'
// import { AtomGenetic } from './genetic'
import Network from './nn/Network'
import NetworkBinaryGeneAdapter from './nn/NetworkBinaryGeneAdapter'
// import NetworkAtomGeneAdapter, { NetworkGeneAtom } from './nn/NetworkAtomGeneAdapter'
import range from './helpers/range'
import { rand } from './helpers/random'


export default defineComponent({
  name: 'App',
  setup() {
    const generations = ref(1)
    const maxScore = ref(0)
    class GeneticGame extends Game {
      public maxBirds = 16
      public parents = 4
      public children = 8
      public divisions = 0
      public mutationRate = 0.4
      // public doubleMutationAfterGen = 20
      // protected genetic = new AtomGenetic<Network, NetworkGeneAtom>(new NetworkAtomGeneAdapter, () => ({ weight: rand(-0xffffffff, 0xffffffff), bias: rand(-0xffffffff, 0xffffffff) }))
      protected genetic = new BinaryGenetic<Network>(new NetworkBinaryGeneAdapter)
      public onGameOver() {
        // if (generations.value == this.doubleMutationAfterGen) this.mutationRate *= 2
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

        const firstParent = parents[0]
        for (const _ of range(this.divisions)) {
          const child = genetic.mutate(firstParent, this.mutationRate)
          nextGenInfo.push({ network: child, score: 0 })
        }

        for (const _ of range(this.children)) {
          const child = genetic.mutate(genetic.crossover(parents), this.mutationRate)
          nextGenInfo.push({ network: child, score: 0 })
        }

        for (const _ of range(this.maxBirds - this.parents - this.divisions - this.children)) {
          nextGenInfo.push({ network: (new NNControl).network, score: 0 })
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

    let render = true
    function toggleSpeed() {
      render = !render
      game.engine.setDraw(render)
      if (render) game.engine.setMaxTps(75)
      else game.engine.setMaxTps(200)
    }

    onMounted(async () => {
      await Promise.all([
        waitImage(Pipe.pipeNorthImg),
        waitImage(Pipe.pipeSouthImg),
        waitImage(Background.bgImg),
        waitImage(Ground.fgImg)
      ])
      console.log('[App] Images loaded')
      game.mount(canvas.value, 75)
      game.run()
    })
    return {
      canvas,
      game,
      tps,
      generations,
      maxScore,
      toggleSpeed
    }
  }
})
</script>
