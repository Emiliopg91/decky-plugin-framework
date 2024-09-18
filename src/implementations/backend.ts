import { call } from "@decky/api";

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class Backend {
  /**
   * Private constructor to prevent instantiation
   */
  private constructor() {}

  /**
   * Generic method to make backend calls to Python plugin methods
   * @param name - The name of the method to call
   * @param params - The parameters to pass to the method
   * @returns A Promise of the result type
   */
  public static backend_call<I extends any[], O>(
    name: string,
    params: I
  ): Promise<O> {
    return call<I, O>(name, ...params);
  }
}
