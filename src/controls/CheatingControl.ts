import Bird, { Control, EnvInfo } from '../game/entities/Bird'


export class CheatingControl extends Control {
  private ticks = 0
  public tick(bird: Bird, { toGround, nextPipe }: EnvInfo) {
    if (this.ticks % 1 == 0) {
      let shouldFlap = false
      if (nextPipe) {
        const { dy } = nextPipe
        shouldFlap = dy < 40
      } else {
        shouldFlap = toGround < 100
      }
      if (shouldFlap) bird.flap()
    }
    this.ticks = (this.ticks + 1) % 0xffffffff
  }
}

export default CheatingControl
