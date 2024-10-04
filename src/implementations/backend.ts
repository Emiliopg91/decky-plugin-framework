import { addEventListener, call, removeEventListener } from "@decky/api";
import { Logger } from "./logger";

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class Backend {
  /**
   * Private constructor to prevent instantiation
   */
  private constructor() { }

  /**
   * Generic method to make backend calls to Python plugin methods
   * @param name - The name of the method to call
   * @param params - The parameters to pass to the method
   * @returns A Promise of the result type
   */
  public static backend_call<I extends any[], O>(
    name: string,
    ...params: I
  ): Promise<O> {
    const t0 = Date.now()
    return new Promise<O>((resolve, reject)=>{
      let paramsStr=""
      if(params){
        params.forEach((val,idx)=>{
          paramsStr=paramsStr+JSON.stringify(val);
          if(idx<params.length-1){
            paramsStr=paramsStr+", "
          }
        })
      }
      Logger.debug("Invoking backend method " + name + "(" + paramsStr + ")")
      call<I, O>(name, ...params).then((value:O)=>{
        Logger.debug("Invocation finished in " + (Date.now() - t0) + " ms with result: ", value)
        resolve(value)
      }).catch((reason:any)=>{
        Logger.debug("Invocation finished in " + (Date.now() - t0) + " ms with error: ", reason)
        reject(reason)
      })
    })
  }

  public static backend_wait(category: string, callBack: (...args: any[]) => void): () => void {
    addEventListener(category, callBack)
    return () => { removeEventListener(category, callBack) }
  }
}