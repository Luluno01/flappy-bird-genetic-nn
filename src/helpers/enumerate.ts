export function *enumerate<T>(it: Iterable<T>): IterableIterator<[ number, T ]> {
  let i = 0
  for(const elem of it) yield [ i++, elem ]
}

export default enumerate
