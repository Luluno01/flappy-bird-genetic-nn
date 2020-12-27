import Entity from '../../engine/objects/Entity'
import newResource from '../../engine/Resource'
import bgURL from '../../assets/images/bg.png'
import Vector2D from '../../engine/Vector2D'

export class Background extends Entity {
  public static bgImg = newResource(Image, bgURL)
  public collisionZIndex = -1

  constructor(x: number, y: number) {
    super()
    this.fragments.push([ new Vector2D(x, y), Background.bgImg ])
  }
}

export default Background
