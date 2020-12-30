import Engine2D from '../engine'
import Background from './entities/Background'
import Bird, { Control } from './entities/Bird'
import Ground from './entities/Ground'
import { PipeManager } from './entities/Pipe'


export class Game {
  public gap = 100
  public pipeInterval = 200
  public gravity = 0.12
  public engine!: Engine2D
  public pipeMgr!: PipeManager
  public canvas!: HTMLCanvasElement
  protected ground!: Ground
  protected birds: Bird[] = []

  public mount(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const engine = this.engine = new Engine2D(canvas)
    const ground = this.ground = new Ground(0, canvas.height - Ground.fgImg.height)
    engine
      .addTickable(new Background(0, 0))
      .addTickable(ground)
    this.pipeMgr = new PipeManager(canvas, engine, this.gap, this.pipeInterval)
  }

  public addBird(control: Control) {
    const bird = new Bird(10, 150 + Math.random() * 200 - 100, this.gravity, this, control)
    this.birds.push(bird)
    this.engine.addTickable(bird)
    return bird
  }

  public _onBirdDeath(_: Bird) {
    if (this.birds.every(bird => bird.dead)) {
      this.pause()
      console.log('[game.Game.Game] All birds died')
      this.onGameOver()
      // this.reset()
      // this.unpause()
      // setTimeout(() => this.unpause(), 2000)
    }
  }

  public onGameOver() {}

  public getGround() {
    return this.ground
  }

  public getBirds() {
    return this.birds
  }

  public run() {
    this.engine.run()
    return this
  }

  public pause() {
    this.engine.pause()
    return this
  }

  public unpause() {
    this.engine.unpause()
    return this
  }

  public reset() {
    this.birds = []
    this.pipeMgr.reset()
  }
}

export default Game
