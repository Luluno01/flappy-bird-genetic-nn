import Entity, { MovingEntity } from '../../engine/objects/Entity'
import newResource from '../../engine/Resource'
import birdURL from '../../assets/images/bird.png'
import flyURL from '../../assets/sounds/fly.mp3'
import scoreURL from '../../assets/sounds/score.mp3'
import Vector2D from '../../engine/Vector2D'
import Pipe, { PipeManager } from './Pipe'
import Engine2D from '../../engine'
import Ground from './Ground'


export interface EnvInfo {
  toGround: number
  nextPipe?: {
    dx: number
    dy: number
    pipe: Pipe
  }
}

export abstract class Control {
  public onDeath(bird: Bird) {}
  public onScore(bird: Bird, passedPipe: Pipe) {}
  public tick(bird: Bird, nextPipeInfo: EnvInfo) {}
}

export class Bird extends Entity implements MovingEntity {
  public static birdImg = newResource(Image, birdURL)
  public static flySnd = newResource(Audio, flyURL)
  public static scoreSnd = newResource(Audio, scoreURL)

  public velocity = new Vector2D(0, 0)
  public acceleration = new Vector2D(0, 0)
  protected pipeMgr: PipeManager
  protected ground: Ground
  protected control: Control
  public dead = false
  public score = 0

  constructor(x: number, y: number, gravity: number, pipeMgr: PipeManager, ground: Ground, control: Control) {
    super()
    this.fragments.push([ new Vector2D(x, y), Bird.birdImg ])
    this.gravity = gravity
    this.pipeMgr = pipeMgr
    this.ground = ground
    this.control = control
  }

  public flap() {
    this.velocity = new Vector2D(0, -3.5)
    Bird.flySnd.play()
    console.log('[game.entities.Bird.Bird] Bird', this.id, 'flaps')
  }

  protected nextPipe?: Pipe
  public tick(engine: Engine2D) {
    if (this.dead) {
      const [ { x }, { width } ] = this.fragments[0]
      if (x + width < 0) {
        engine.removeTickable(this)
      }
    } else {
      const pos = this.fragments[0][0]
      if (pos.y < 0) pos.y = 0
      const { x, y } = pos
      const { ground } = this
      const envInfo: EnvInfo = {
        toGround: ground.fragments[0][0].y - y
      }
      const { nextPipe, control } = this
      let noNextPipe = true
      for (const pipe of this.pipeMgr.pipes) {
        const [ southPipePos, ] = pipe.fragments[1]
        const xFar = southPipePos.x + Pipe.width
        if (xFar > x) {
          // Found the "next" pipe
          if (nextPipe && nextPipe != pipe) {
            Bird.scoreSnd.play()
            try {
              this.score++
              control.onScore(this, nextPipe)
            } catch (err) {
              console.warn('Error calling "onScore" for control', control, err)
            }
          }
          this.nextPipe = pipe  // Always update next pipe and the env info
          envInfo.nextPipe = {
            dx: xFar - x,
            dy: southPipePos.y - y,
            pipe
          }
          noNextPipe = false
          break
        } else {
          // Passed pipe
        }
      }
      if (noNextPipe) this.nextPipe = undefined
      try {
        control.tick(this, envInfo)
      } catch (err) {
        console.warn('Error calling "tick" for control', control, err)
      }
    }
  }

  public onCollideInto(engine: Engine2D, entities: Entity[]) {
    if (this.dead) return
    if (entities.every(entity => !(entity instanceof Ground) && !(entity instanceof Pipe))) return
    console.log('[game.entities.Bird.Bird] Bird', this.id, 'dead')
    this.gravity = 0
    this.velocity = new Vector2D(-1, 0)
    this.acceleration = new Vector2D(0, 0)
    this.dead = true
    this.control.onDeath(this)
  }

  public onRemove() {
    console.log('[game.entities.Bird.Bird] Bird', this.id, 'removed from engine')
  }
}

export default Bird
