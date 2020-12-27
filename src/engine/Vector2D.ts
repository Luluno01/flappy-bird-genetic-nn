export class Vector2D {
  public x: number
  public y: number
  public angular: number
  constructor(x: number, y: number, rotation: number = 0) {
    this.x = x
    this.y = y
    this.angular = rotation
  }

  public static create(x: number, y: number, rotation: number = 0) {
    return new Vector2D(x, y, rotation)
  }

  public add({ x, y, angular: rotation }: Partial<Vector2D>) {
    if (typeof x == 'number') this.x += x
    if (typeof y == 'number') this.y += y
    if (typeof rotation == 'number') this.angular += rotation
    return this
  }

  public sub({ x, y, angular: rotation }: Partial<Vector2D>) {
    if (typeof x == 'number') this.x -= x
    if (typeof y == 'number') this.y -= y
    if (typeof rotation == 'number') this.angular -= rotation
    return this
  }

  public mul({ x, y, angular: rotation }: Partial<Vector2D>) {
    if (typeof x == 'number') this.x *= x
    if (typeof y == 'number') this.y *= y
    if (typeof rotation == 'number') this.angular *= rotation
    return this
  }

  public div({ x, y, angular: rotation }: Partial<Vector2D>) {
    if (typeof x == 'number') this.x /= x
    if (typeof y == 'number') this.y /= y
    if (typeof rotation == 'number') this.angular /= rotation
    return this
  }

  public clone() {
    const { x, y, angular: rotation } = this
    return new Vector2D(x, y, rotation)
  }
}

export default Vector2D
