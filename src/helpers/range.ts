export function *range(a: number, b?: number) {
  if (b === undefined) {
    [ a, b ] = [ 0, a ]
  }
  if (a == b) return
  else if (a < b) {
    for (let i = a; i < b; i++) yield i
  } else {
    for (let i = a; i > b; i--) yield i
  }
}

export default range
