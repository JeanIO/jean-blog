//todo 这里的泛型运用刚好可以学学
export function splitToIdById(list: any[]) {
  if(!Array.isArray(list)) {
    throw new Error("Only Array can be accepted")
  }
  let byId: any = {}
  let ids: any[] = []
  list.forEach(item => {
    byId[item.id] = item;
    ids.push(item.id)
  })
  return {
    byId, ids
  }
}

export enum AsyncState {
  UNSTARTED,
  PENDING,
  FULLFILLED,
  REJECTED
}

// 异步共享组件 包含了组件loading 以及结果信息
export const createLoadingState = <T>(state: T) => {
  let initialState = {
    ...state,
    async_stats: AsyncState.UNSTARTED
  }
  return initialState
}

export const isPromise = (arg: any) => {
  if(arg && arg.then) {
    return true
  }
  return false
}

export const debouncePromise = <T extends (req: ReqType) => Promise<ResType>, ReqType = any, ResType = any>(fun: T, getKey?: (req: any) => string) => {
  let map = new Map<string, Promise<ResType>>()
  getKey = getKey || function (opts: ReqType ) {
    return JSON.stringify(opts)
  }

  return (req: ReqType) => {
    let key = getKey(req)
    let prom = map.get(key)
    if(isPromise(prom)) {
      return prom
    } else {
      prom = fun(req)
      prom.finally(() => {
        map.delete(key)
      })
      map.set(key, prom)
      return prom
    }
  }
}
