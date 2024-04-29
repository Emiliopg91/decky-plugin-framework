import { ServerAPI } from "decky-frontend-lib";

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class Backend {

    /**
     * Private constructor to prevent instantiation
     */
    private constructor() {
    }

    /**
     * Static instance of ServerAPI to handle API calls
     */
    private static serverApi: ServerAPI = null!;

    /**
     * Method to initialize the server API
     * @param serverApi - An instance of ServerAPI
     */
    public static initialize(serverApi: ServerAPI) {
        Backend.serverApi = serverApi;
    }

    /**
     * Generic method to make backend calls to Python plugin methods
     * @param name - The name of the method to call
     * @param params - The parameters to pass to the method
     * @returns A Promise of the result type
     */
    public static backend_call<I, O>(name: string, params: I): Promise<O> {
        return new Promise((resolve, reject) => {
            try {
                Backend.serverApi.callPluginMethod<I, O>(name, params).then((e) => {
                    if (e.success) {
                        resolve(e.result as O)
                    } else {
                        reject(e);
                    }
                })
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default Backend;