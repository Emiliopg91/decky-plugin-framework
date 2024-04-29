import { Backend } from "./backend"
import { Logger } from "./logger"

export class Configuration {
    private static configuration: Record<string, string> = {}

    private static callbacks: Record<number, (e: { [key: string]: string }) => void> = {};

    public static async initialize() {
        Configuration.configuration = {}
        const data = await Backend.backend_call<{}, string[][]>("get_config", {});
        data.forEach((e) => {
            Configuration.configuration[e[0]] = e[1];
        });
        Logger.info("Loaded configuration from file: " + JSON.stringify(Configuration.configuration));
    }

    public static getEntry<T>(key: keyof T, defaultValue: string | null = null): string | null {
        let result = Configuration.configuration[String(key)];
        if (result != null && result != undefined)
            return result;
        return defaultValue;
    }

    public static async setEntry<T>(key: keyof T, value: string, persist: boolean = false) {
        Logger.info("Setting configuration '" + String(key) + "'='" + value + "'")
        Configuration.configuration[String(key)] = value;
        if (persist) {
            Logger.info("Persisting to config file")
            await Backend.backend_call<{ key: string, value: string }, null>("set_config", { key: String(key), value });
        }
        Configuration.invokeCallbacks()
    }

    private static invokeCallbacks() {
        Object.values(Configuration.callbacks).forEach((f) => { f(Configuration.configuration) })
    }

    public static subscribe(callback: (e: { [key: string]: string }) => void): number {
        const id = Date.now();
        Configuration.callbacks[id] = callback;
        return id;
    }

    public static unsubscribe(id: number) {
        delete Configuration.callbacks[id];
    }
}
export default Configuration;