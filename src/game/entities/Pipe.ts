import Entity, { MovingEntity } from '../../engine/objects/Entity'
import newResource from '../../engine/Resource'
import pipeNorthURL from '../../assets/images/pipeNorth.png'
import pipeSouthURL from '../../assets/images/pipeSouth.png'
import Vector2D from '../../engine/Vector2D'
import Engine2D from '../../engine'
import { Ref } from 'vue'


export class Pipe extends Entity implements MovingEntity {
  public static pipeNorthImg = newResource(Image, pipeNorthURL)
  public static pipeSouthImg = newResource(Image, pipeSouthURL)
  public static get width() {
    return Math.max(this.pipeNorthImg.width, this.pipeSouthImg.width)
  }

  /**
   * This will not update automatically
   */
  public gap: number

  public velocity = new Vector2D(-1, 0)
  public acceleration = new Vector2D(0, 0)

  public _removed = false

  constructor(x: number, y: number, gap: number) {
    super()
    this.fragments.push([ new Vector2D(x, y), Pipe.pipeNorthImg ])
    this.fragments.push([ new Vector2D(x, y + Pipe.pipeNorthImg.height + gap), Pipe.pipeSouthImg ])
    this.gap = gap
  }

  public tick(engine: Engine2D) {
    if (this.fragments.every(([ pos, img ]) => pos.x < -img.width)) {
      engine.removeTickable(this)
      this._removed = true
    }
  }
}

export default Pipe

export class PipeManager {
  protected canvas: Ref<HTMLCanvasElement>
  protected engine: Engine2D
  public pipes: Pipe[] = []
  public get maxPipePoolSize() {
    return Math.ceil(this.canvas.value.width / Pipe.width) * 2
  }
  public gap: number
  public interval: number
  protected MPipe: typeof Pipe
  constructor(canvas: Ref<HTMLCanvasElement>, engine: Engine2D, gap: number, interval: number) {
    this.canvas = canvas
    this.engine = engine
    this.gap = gap
    this.interval = interval
    const pipeMgr = this
    this.MPipe = class MPipe extends Pipe {
      onRemove() {
        console.log('[game.entities.Pipe.Pipe] Pipe removed by engine')
        pipeMgr.nextPipe()
      }
    }
    const { pipes, maxPipePoolSize } = this
    while (pipes.length < maxPipePoolSize) this.nextPipe()
  }

  public nextPipe() {
    const { MPipe, pipes, engine, gap, interval, maxPipePoolSize } = this
    let i = 0
    for (const { _removed } of pipes) {
      if (!_removed) break
      i++
    }
    pipes.splice(0, i)  // Also remove pipes that are removed from the engine
    if (pipes.length >= maxPipePoolSize) return  // No need
    const nextY = Math.floor(Math.random() * Pipe.pipeNorthImg.height) - Pipe.pipeNorthImg.height
    let pipe: Pipe
    const currentPipes = pipes.length
    if (currentPipes) {
      pipe = new MPipe(
        pipes[currentPipes - 1].fragments[0][0].x + interval,
        nextY,
        gap
      )
    } else {
      pipe = new MPipe(
        this.canvas.value.width,
        nextY,
        gap
      )
    }
    console.log('[game.entities.Pipe.PipeManager] Creating next pipe')
    pipes.push(pipe)
    engine.addTickable(pipe)
  }
}
