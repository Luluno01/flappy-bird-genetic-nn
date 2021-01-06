import enumerate from './enumerate'


export function zip<T1>(it1: Iterable<T1>): IterableIterator<[ T1 ]>
export function zip<T1, T2>(it1: Iterable<T1>, it2: Iterable<T2>): IterableIterator<[ T1, T2 ]>
export function zip<T1, T2, T3>(it1: Iterable<T1>, it2: Iterable<T2>, it3: Iterable<T3>): IterableIterator<[ T1, T2, T3 ]>
export function zip<T1, T2, T3, T4>(it1: Iterable<T1>, it2: Iterable<T2>, it3: Iterable<T3>, it4: Iterable<T4>): IterableIterator<[ T1, T2, T3, T4 ]>
export function zip<T1, T2, T3, T4, T5>(it1: Iterable<T1>, it2: Iterable<T2>, it3: Iterable<T3>, it4: Iterable<T4>, it5: Iterable<T5>): IterableIterator<[ T1, T2, T3, T4, T5 ]>
export function zip<T>(...its: Iterable<T>[]): IterableIterator<T[]>
export function *zip(...its: Iterable<any>[]): IterableIterator<any[]> {
  const _its = its.map(it => it[Symbol.iterator]())
  while (true) {
    let allDone = true
    const res: any[] = new Array(its.length)
    for (const [ i, it ] of enumerate(_its)) {
      const { value, done } = it.next()
      if (!done) allDone = false
      res[i] = value
    }
    if (allDone) return
    yield res
  }
}

export default zip
