import Engine2D from '..'
import Vector2D from '../Vector2D'
import Tickable from './Tickable'


export abstract class Entity extends Tickable {
  public gravity: number = 0
  public fragments: [ Vector2D, HTMLImageElement ][] = []
  public collisionZIndex: number = 0
  public drawZIndex: number = 0
  public onCollideInto?(engine: Engine2D, entities: Entity[]): void

  public static isEntity(obj: any): obj is Entity {
    return obj instanceof Entity
  }

  public static isMovingEntity(obj: any): obj is MovingEntity {
    return Entity.isEntity(obj) && 'velocity' in obj && 'acceleration' in obj
  }

  public draw(context: CanvasRenderingContext2D) {
    const { fragments } = this
    for (const [ { x, y, angular }, image ] of fragments) {
      image.style.transform = `rotate(${angular}deg)`
      context.drawImage(image, x, y)
    }
  }
}

export default Entity

export interface LivingEntity extends Entity {
  dead: boolean
  kill(): void
}

export interface MovingEntity extends Entity {
  velocity: Vector2D
  acceleration: Vector2D
}
