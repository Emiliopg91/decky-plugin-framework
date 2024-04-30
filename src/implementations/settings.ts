import { Backend } from "./backend"
import { EventBus } from "./eventBus";
import { EventType } from "../types/eventBus.types";
import { Logger } from "./logger"
import { SettingsEventData } from "../types/settings.types"

export class Settings {
    private static configuration: Record<string, string> = {}

    public static async initialize() {
        Settings.configuration = await Backend.backend_call<{}, any>("get_config", {});
        Logger.info("Loaded configuration from file: " + JSON.stringify(Settings.configuration));
        Settings.notifyChanges();
    }

    public static stop() {
        EventBus.unsubscribeAll(EventType.SHORTCUT)
    }

    public static getEntry<T>(key: keyof T, defaultValue: string | null = null): string | null {
        let result = Settings.configuration[String(key)];
        if (result != null && result != undefined)
            return result;
        return defaultValue;
    }

    public static async setEntry<T>(key: keyof T, value: string, persist: boolean = false) {
        Logger.info("Setting configuration '" + String(key) + "'='" + value + "'")
        Settings.configuration[String(key)] = value;
        if (persist) {
            Logger.info("Persisting to config file")
            Backend.backend_call<{ key: string, value: string }, null>("set_config", { key: String(key), value });
        }
        Settings.notifyChanges();
    }

    private static async notifyChanges() {
        const data: SettingsEventData = new SettingsEventData({ ...Settings.configuration })
        EventBus.publishEvent(EventType.SETTINGS, data)
    }
}