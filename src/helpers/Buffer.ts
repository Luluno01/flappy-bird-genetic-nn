import range from "./range"

export class Buffer extends ArrayBuffer {
  protected view = new DataView(this)
  public static alloc(size: number) {
    return new Buffer(size)
  }

  public writeFloatLE(value: number, offset = 0) {
    this.view.setFloat32(offset, value, true)
    return offset + 4
  }

  public readFloatLE(offset = 0) {
    return this.view.getFloat32(offset, true)
  }

  public readUInt8(offset = 0) {
    return this.view.getUint8(offset)
  }

  public writeUInt8(value: number, offset = 0) {
    this.view.setUint8(offset, value)
    return offset + 1
  }

  public get length() {
    return this.byteLength
  }

  public toString() {
    let str = ''
    for (const i of range(this.length)) {
      str += this.readUInt8(i).toString(16).padStart(2, '0')
    }
    return str
  }
}

export default Buffer
