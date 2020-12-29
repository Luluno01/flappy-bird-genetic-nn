import newResource from './Resource'
import Identifiable, { ID } from './objects/id'
import Tickable from './objects/Tickable'
import Vector2D from './Vector2D'
import Entity from './objects/Entity'


export function isInside({ x: px, y: py }: Pick<Vector2D, 'x' | 'y'>, { x: xl, y: yl }: Pick<Vector2D, 'x' | 'y'>, { width, height }: Pick<HTMLImageElement, 'width' | 'height'>) {
  const xu = xl + width
  const yu = yl + height
  return xl <= px && px <= xu && yl <= py && py <= yu
}

export function isColliding(entity1: Entity, entity2: Entity) {
  if (entity1.collisionZIndex != entity2.collisionZIndex) return false
  for (const [ pos1, img1 ] of entity1.fragments) {
    for (const [ pos2, img2 ] of entity2.fragments) {
      const { x: x1, y: y1 } = pos1
      const { x: x2, y: y2 } = pos2
      const { width: w1, height: h1 } = img1
      const { width: w2, height: h2 } = img2
      // [x1, x1 + w1], [y1, y1 + h1]
      // [x2, x2 + w2], [y2, y2 + h2]
      const x1u = x1 + w1  // x1 upper bound
      const y1u = y1 + h1  // y1 upper bound
      const x2u = x2 + w2  // x2 upper bound
      const y2u = y2 + h2  // y2 upper bound
      if (isInside({ x: x1, y: y1 }, pos2, img2) ||
        isInside({ x: x1, y: y1u }, pos2, img2) ||
        isInside({ x: x1u, y: y1 }, pos2, img2) ||
        isInside({ x: x1u, y: y1u }, pos2, img2) ||
        isInside({ x: x2, y: y2 }, pos1, img1) ||
        isInside({ x: x2, y: y2u }, pos1, img1) ||
        isInside({ x: x2u, y: y2 }, pos1, img1) ||
        isInside({ x: x2u, y: y2u }, pos1, img1)) {
        return true
      }
    }
  }
  return false
}

export class Engine2D {
  protected canvas: HTMLCanvasElement
  protected context: CanvasRenderingContext2D
  public get canvasWidth() {
    return this.canvas.width
  }
  public get canvasHeight() {
    return this.canvas.height
  }
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!!
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

  protected paused = false

  public pause() {
    this.paused = true
    return this
  }

  public unpause() {
    this.paused = false
    return this.run()
  }

  public run() {
    if (this.paused) return this
    requestAnimationFrame(() => {
      this.tick()
      this.draw()
      this.run()  // Loop
    })
    return this
  }
}

export default Engine2D
