import Bird, { Control, EnvInfo } from '../game/entities/Bird'


export class RandomControl extends Control {
  private ticks = 0
  public tick(bird: Bird, { nextPipe }: EnvInfo) {
    if (this.ticks % 1 == 0) {
      if (Math.random() < 0.6 && nextPipe && nextPipe.dy < 40) bird.flap()
    }
    this.ticks = (this.ticks + 1) % 0xffffffff
  }
}

export default RandomControl
