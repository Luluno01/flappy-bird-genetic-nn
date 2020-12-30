export function randint(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower)) + lower
}

export default randint
