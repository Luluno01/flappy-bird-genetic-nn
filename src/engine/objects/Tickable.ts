import Engine2D from '..'
import Identifiable from './id'


export abstract class Tickable extends Identifiable {
  public tick?(engine: Engine2D): void
  public onRemove?(engine: Engine2D): void
}

export default Tickable
