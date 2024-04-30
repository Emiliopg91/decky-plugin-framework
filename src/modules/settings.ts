import { Backend } from "./backend"
import { EventBus, EventData, EventType } from "./eventBus";
import { Logger } from "./logger"

export class SettingsEventData extends EventData {
    private _settings: Record<string, string>

    public constructor(settings: Record<string, string>) {
        super()
        this._settings = settings;
    }

    public getSettings(): Record<string, string> {
        return this._settings;
    }
}

export class Settings {
    private static configuration: Record<string, string> = {}

    public static async initialize() {
        Settings.configuration = {}
        const data = await Backend.backend_call<{}, string[][]>("get_config", {});
        data.forEach((e) => {
            Settings.configuration[e[0]] = e[1];
        });
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