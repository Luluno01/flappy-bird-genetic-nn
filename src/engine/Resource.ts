export default function newResource(ctor: typeof Image, src: string): InstanceType<typeof ctor>
export default function newResource(ctor: typeof Audio, src: string): InstanceType<typeof ctor>
export default function newResource(ctor: typeof Image | typeof Audio, src: string): InstanceType<typeof ctor> {
  const resource = new ctor
  resource.src = src
  return resource
}

export function waitImage(elem: HTMLImageElement) {
  return new Promise<typeof elem>((res, rej) => {
    if (elem.complete) return res(elem)
    else {
      function onLoad() {
        elem.removeEventListener('load', onLoad)
        elem.removeEventListener('error', onError)
        res(elem)
      }
      function onError(err: ErrorEvent) {
        elem.removeEventListener('load', onLoad)
        elem.removeEventListener('error', onError)
        rej(err)
      }
      elem.addEventListener('load', onLoad)
      elem.addEventListener('error', onError)
    }
  })
}
