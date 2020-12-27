export type ID = number

export class IDAllocator {
  protected nextID: ID = 1
  public alloc(): ID {
    const { nextID } = this
    this.nextID = nextID % 0xffff_ffff + 1
    return nextID
  }
}

export abstract class Identifiable {
  protected static allocator = new IDAllocator
  public id: ID
  constructor() {
    this.id = Identifiable.allocator.alloc()
  }

  public static isIdentifiable(obj: any): obj is Identifiable {
    return obj instanceof Identifiable
  }
}

export default Identifiable
