import Entity from '../engine/objects/Entity'
import Vector2D from '../engine/Vector2D'


export function isInside({ x: px, y: py }: Pick<Vector2D, 'x' | 'y'>, { x: xl, y: yl }: Pick<Vector2D, 'x' | 'y'>, { width, height }: Pick<HTMLImageElement, 'width' | 'height'>) {
  const xu = xl + width
  const yu = yl + height
  return xl <= px && px <= xu && yl <= py && py <= yu
}

export function isRangeColliding(x1: number, x1u: number, x2: number, x2u: number) {
  if (x1 < x2) {
    return x1u >= x2
  } else {
    return x2u >= x1
  }
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
      // if (isInside({ x: x1, y: y1 }, pos2, img2) ||
      //   isInside({ x: x1, y: y1u }, pos2, img2) ||
      //   isInside({ x: x1u, y: y1 }, pos2, img2) ||
      //   isInside({ x: x1u, y: y1u }, pos2, img2) ||
      //   isInside({ x: x2, y: y2 }, pos1, img1) ||
      //   isInside({ x: x2, y: y2u }, pos1, img1) ||
      //   isInside({ x: x2u, y: y2 }, pos1, img1) ||
      //   isInside({ x: x2u, y: y2u }, pos1, img1)) {
      //   return true
      // }
      if (isRangeColliding(x1, x1u, x2, x2u) && isRangeColliding(y1, y1u, y2, y2u)) return true
    }
  }
  return false
}
