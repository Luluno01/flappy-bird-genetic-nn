import Buffer from '../helpers/Buffer'


export function getBitFromByte(byte: number, bitIndex: number) {
  return (byte >> (8 - bitIndex - 1)) & 0x01
}

export function getBitFromBuffer(data: Buffer, bitIndex: number) {
  const byteIndex = Math.floor(bitIndex / 8)
  const bitOffset = bitIndex % 8
  return getBitFromByte(data.readUInt8(byteIndex), bitOffset)
}

export function flipBitForByte(byte: number, bitIndex: number) {
  return byte ^ (0x1 << (8 - bitIndex - 1))
}

export function flipBitForBuffer(data: Buffer, bitIndex: number) {
  const byteIndex = Math.floor(bitIndex / 8)
  const bitOffset = bitIndex % 8
  data.writeUInt8(flipBitForByte(data.readUInt8(byteIndex), bitOffset), byteIndex)
  return data
}

export function setBitForByte(byte: number, bitIndex: number, bit: number) {
  return byte | (bit << (8 - bitIndex - 1))
}

export function setBitForBuffer(data: Buffer, bitIndex: number, bit: number) {
  const byteIndex = Math.floor(bitIndex / 8)
  const bitOffset = bitIndex % 8
  data.writeUInt8(setBitForByte(data.readUInt8(byteIndex), bitOffset, bit), byteIndex)
  return data
}
