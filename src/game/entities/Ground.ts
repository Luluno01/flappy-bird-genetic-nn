import Entity from '../../engine/objects/Entity'
import newResource from '../../engine/Resource'
import fgURL from '../../assets/images/fg.png'
import Vector2D from '../../engine/Vector2D'

export class Ground extends Entity {
  public static fgImg = newResource(Image, fgURL)
  public drawZIndex = 1

  constructor(x: number, y: number) {
    super()
    this.fragments.push([ new Vector2D(x, y), Ground.fgImg ])
  }
}

export default Ground
