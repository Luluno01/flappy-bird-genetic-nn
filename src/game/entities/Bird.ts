import Entity, { MovingEntity } from '../../engine/objects/Entity'
import newResource from '../../engine/Resource'
import birdURL from '../../assets/images/bird.png'
import flyURL from '../../assets/sounds/fly.mp3'
import Vector2D from '../../engine/Vector2D'


export class Bird extends Entity implements MovingEntity {
  public static birdImg = newResource(Image, birdURL)
  public static flySnd = newResource(Audio, flyURL)

  public velocity = new Vector2D(0, 0)
  public acceleration = new Vector2D(0, 0)

  constructor(x: number, y: number, gravity: number) {
    super()
    this.fragments.push([ new Vector2D(x, y), Bird.birdImg ])
    this.gravity = gravity
  }

  public flap() {
    this.velocity = new Vector2D(0, -3.5)
    Bird.flySnd.play()
    console.log('[game.entities.Bird.Bird] Flap')
  }
}

export default Bird
