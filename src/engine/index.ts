import newResource from './Resource'
import Identifiable, { ID } from './objects/id'
import Tickable from './objects/Tickable'
import Entity from './objects/Entity'
import { isColliding } from '../helpers/collision'


export class Engine2D {
  protected canvas: HTMLCanvasElement
  protected context: CanvasRenderingContext2D
  public get canvasWidth() {
    return this.canvas.width
  }
  public get canvasHeight() {
    return this.canvas.height
  }
  protected _tps = 0
  public tps = 0
  /**
   * Desired FPS
   */
  public maxTps: number
  constructor(canvas: HTMLCanvasElement, maxTps: number = 60) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!!
    this.maxTps = maxTps
  }

  static newResource = newResource

  protected tickables = new Map<ID, Tickable>()
  protected removalQueue = new Set<ID>()

  public addTickable(tickable: Tickable) {
    this.tickables.set(tickable.id, tickable)
    return this
  }

  public removeTickable(tickable: Tickable | ID) {
    // Remove it next tick
    if (Identifiable.isIdentifiable(tickable)) {
      this.removalQueue.add(tickable.id)
    } else {
      this.removalQueue.add(tickable)
    }
    return this
  }

  /**
   * Do a single tick
   * 
   * 1. Tick physics
   * 2. Collision detection
   * 3. Tick objects
   */
  protected tick() {
    // this.notify('before-tick')
    this._tps++
    const { removalQueue, tickables } = this
    for (const id of removalQueue) {
      const tickable = tickables.get(id)
      tickables.delete(id)
      try {
        tickable?.onRemove?.(this)
      } catch (err) {
        console.warn('Error calling "onRemove" for object', tickable, err)
      }
    }
    removalQueue.clear()
    // Physical tick
    for (const tickable of tickables.values()) {
      if (Entity.isMovingEntity(tickable)) {
        const { fragments, velocity, acceleration, gravity } = tickable
        for (const [ position ] of fragments) {
          position.add(velocity)
        }
        velocity
          .add(acceleration)
          .add({ x: 0, y: gravity })
      }
    }
    // Minimal collision detection
    const entities = Array.from(tickables.values()).filter(Entity.isEntity)
    const collision = new Map<Entity, Entity[]>()
    for (const entity0 of entities) {
      for (const entity1 of entities) {
        if (entity0 === entity1) continue
        if (isColliding(entity0, entity1)) {
          if (collision.has(entity0)) {
            collision.get(entity0)!.push(entity1)
          } else {
            collision.set(entity0, [ entity1 ])
          }
          if (collision.has(entity1)) {
            collision.get(entity1)!.push(entity0)
          } else {
            collision.set(entity1, [ entity0 ])
          }
        }
      }
    }
    for (const [ entity, victims ] of collision) {
      try {
        entity.onCollideInto?.(this, victims)
        // this.notify('collision', { entity, victims })
      } catch (err) {
        console.warn('Error calling "onCollideInto" for object', entity, err)
      }
    }
    // Programming tick
    for (const tickable of tickables.values()) {
      try {
        tickable.tick?.(this)
      } catch (err) {
        console.warn('Error ticking object', tickable, err)
      }
    }
    // this.notify('tick')
  }

  protected draw() {
    const { context } = this
    const sortedEntities = Array.from(this.tickables.values())
      .filter(Entity.isEntity)
      .sort((a, b) => {
        const collisionDiff = a.collisionZIndex - b.collisionZIndex
        if (collisionDiff) return collisionDiff
        else return a.drawZIndex - b.drawZIndex
      })
    for (const tickable of sortedEntities) {
      try {
        tickable.draw(context)
      } catch (err) {
        console.warn('Error rendering object', tickable, err)
      }
    }
  }

  protected _paused = false
  public get paused() {
    return this._paused
  }
  protected tpsInt?: ReturnType<typeof setInterval>

  public pause() {
    this._paused = true
    if (this.tpsInt !== undefined) {
      clearInterval(this.tpsInt)
      this.tpsInt = undefined
    }
    if (this.tickTimeout !== undefined) {
      clearInterval(this.tickTimeout)
      this.tickTimeout = undefined
    }
    return this
  }

  public unpause() {
    this._paused = false
    return this.run()
  }

  public run() {
    this.tpsInt = setInterval(() => {
      this.tps = this._tps
      this._tps = 0
    }, 1000)
    this._run()
  }

  public shouldDraw = true
  public setMaxTps(tps: number) {
    this.maxTps = tps
  }
  public setDraw(shouldDraw: boolean) {
    if (!this.paused) this.pause()
    this.shouldDraw = shouldDraw
    this.unpause()
  }

  protected tickTimeout?: ReturnType<typeof setTimeout>
  protected _run() {
    if (this._paused) return this
    this.tickTimeout = setTimeout(() => {
      this.tick()
      if (this.shouldDraw) requestAnimationFrame(() => this.draw())
      this._run()
    }, 1000 / this.maxTps)
    return this
  }
}

export default Engine2D
