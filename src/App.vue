<template>
  <canvas ref="canvas" width="288" height="512"></canvas>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref, ToRefs } from 'vue'
import Engine2D from './engine'
import Entity from './engine/objects/Entity'
import { waitImage } from './engine/Resource'
import Vector2D from './engine/Vector2D'
import Background from './game/entities/Background'
import Bird from './game/entities/Bird'
import Ground from './game/entities/Ground'
import Pipe, { PipeManager } from './game/entities/Pipe'


export default defineComponent({
  name: 'App',
  // setup() {
  //   function newResource(ctor: typeof Image, src: string): InstanceType<typeof ctor>
  //   function newResource(ctor: typeof Audio, src: string): InstanceType<typeof ctor>
  //   function newResource(ctor: typeof Image | typeof Audio, src: string): InstanceType<typeof ctor> {
  //     const resource = new ctor
  //     resource.src = src
  //     return resource
  //   }

  //   /**
  //    * Pipe pair positioned by the north pipe
  //    */
  //   class Pipe {
  //     public x: number
  //     public y: number
  //     constructor(x: number, y: number) {
  //       this.x = x
  //       this.y = y
  //     }
  //   }

  //   const gap = 100
  //   const pipeInterval = 200
  //   const gravity = 1.5

  //   const canvas = ref<HTMLCanvasElement>(null as any)
  //   const birdImg = newResource(Image, birdURL)
  //   const bgImg = newResource(Image, bgURL)
  //   const fgImg = newResource(Image, fgURL)
  //   const pipeNorthImg = newResource(Image, pipeNorthURL)
  //   const pipeSouthImg = newResource(Image, pipeSouthURL)
  //   const flySnd = newResource(Audio, flyURL)
  //   const scoreSnd = newResource(Audio, scoreURL)
  //   const pipeSouthYOffset = pipeNorthImg.height + gap
  //   const pipePairWidth = Math.max(pipeNorthImg.width, pipeSouthImg.width)
  //   const pipeExitX = -pipePairWidth
  //   const pipeNorthHeight = pipeNorthImg.height
  //   const { width: birdWidth, height: birdHeight } = birdImg

  //   onMounted(async () => {
  //     const maxPipePoolSize = Math.ceil(canvas.value.width / pipePairWidth) * 2
  //     const context = canvas.value.getContext('2d')!!
  //     /**
  //      * Bird X
  //      */
  //     let bX = 10
  //     /**
  //      * Bird Y
  //      */
  //     let bY = 150
  //     let score = 0

  //     const pipes = [
  //       new Pipe(canvas.value.width, 0)
  //     ]

  //     function draw() {
  //       context.drawImage(bgImg, 0, 0)

  //       let shouldGenNewPipe = false
  //       for (const pipe of pipes) {
  //         const { x, y } = pipe
  //         context.drawImage(pipeNorthImg, x, y)
  //         context.drawImage(pipeSouthImg, x, y + pipeSouthYOffset)
          
  //         pipe.x--  // Tick the pipe

  //         if (x <= bX + birdWidth && bX <= x + pipePairWidth && (bY <= y + pipeNorthHeight || bY + birdHeight >= y + pipeSouthYOffset) || bY + birdHeight >= canvas.value.height - fgImg.height) {
  //           location.reload()
  //           return
  //         }

  //         if (x == 5) {
  //           score++
  //           scoreSnd.play()
  //         }
  //       }
        
  //       let i = 0
  //       for (const { x } of pipes) {
  //         if (x >= pipeExitX) break
  //         i++
  //       }
  //       pipes.splice(0, i)  // Remove out of bound pipes

  //       if (pipes.length < maxPipePoolSize) {
  //         pipes.push(new Pipe((pipes[pipes.length - 1]?.x || canvas.value.width) + pipeInterval, Math.floor(Math.random() * pipeNorthHeight) - pipeNorthHeight))
  //       }

  //       context.drawImage(fgImg, 0, canvas.value.height - fgImg.height)
  //       context.drawImage(birdImg, bX, bY)
  //       bY += gravity
  //       context.fillStyle = '#000'
  //       context.font = '20px Verdana'
  //       context.fillText(`Score: ${score}`, 10, canvas.value.height - 20)

  //       requestAnimationFrame(draw)
  //     }

  //     document.addEventListener('keydown', () => {
  //       bY -= 25
  //       bY = Math.max(0, bY)
  //       flySnd.play()
  //     })

  //     draw()
  //   })
  //   return {
  //     canvas,
  //     birdImg,
  //     bgImg,
  //     fgImg,
  //     pipeNorthImg,
  //     pipeSouthImg,
  //     flySnd,
  //     scoreSnd
  //   }
  // }
  setup() {
    const gap = 100
    const pipeInterval = 200
    const gravity = 1.5
    const canvas = ref<HTMLCanvasElement>(null as any)

    let engine: Engine2D
    let pipeMgr: PipeManager
    onMounted(async () => {
      await Promise.all([
        waitImage(Pipe.pipeNorthImg),
        waitImage(Pipe.pipeSouthImg),
        waitImage(Background.bgImg),
        waitImage(Ground.fgImg)
      ])
      console.log('[App] Images loaded')
      engine = new Engine2D(canvas)
      class MBird extends Bird {
        public onCollideInto(entities: Entity[]) {
          if (entities.length) {
            console.log('[App.MBird] Bird dead')
            engine.pause()
          }
        }

        private ticks = 0
        public tick() {
          const pos = this.fragments[0][0]
          if (pos.y < 0) pos.y = 0
          if (this.ticks % 1 == 0) {
            for (const pipe of pipeMgr.pipes) {
              const [ southPipePos, ] = pipe.fragments[1]
              if (southPipePos.x + Pipe.width > pos.x) {
                // Found the "next" pipe
                const dstY = southPipePos.y - 0.3 * pipe.gap
                if (pos.y > dstY) this.flap()
                break
              }
            }
          }
          this.ticks = (this.ticks + 1) % 0xffffffff
        }
      }
      engine
        .addTickable(new Background(0, 0))
        .addTickable(new Ground(0, canvas.value.height - Ground.fgImg.height))
        .addTickable(new MBird(10, 150, 0.12))
      pipeMgr = new PipeManager(canvas, engine, gap, pipeInterval)
      engine.run()
    })
    return {
      canvas
    }
  }
})
</script>
