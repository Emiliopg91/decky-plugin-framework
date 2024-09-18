import { Backend } from "./backend";
import { EventBus } from "./eventBus";
import { EventType } from "../types/eventBus";
import { Logger } from "./logger";
import { SettingsEventData } from "../types/settings";

/**
 * Class for deal with plugin configuration
 */
export class Settings {
  /**
   * Map of configuration
   */
  private static configuration: Record<string, string> = {};

  /**
   * Load configuration from file
   */
  public static async initialize() {
    Settings.configuration = await Backend.backend_call<[], any>("get_config");
    Logger.info(
      "Loaded configuration from file: " +
        JSON.stringify(Settings.configuration)
    );
    Settings.notifyChanges();
  }

  /**
   * Stop subscriptions
   */
  public static stop() {
    EventBus.unsubscribeAll(EventType.SHORTCUT);
  }

  public static getConfiguration(): Record<string, string> {
    return JSON.parse(JSON.stringify(this.configuration));
  }

  public static getConfigurationStructured(): Record<string, string> {
    const structured: any = {};
    let record = Settings.configuration;
    for (const key in record) {
      const value = record[key];
      const keyParts = key.split(".");

      let currentLevel = structured;

      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!(part in currentLevel)) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      }

      const lastPart = keyParts[keyParts.length - 1];
      currentLevel[lastPart] = value;
    }

    return structured;
  }

  /**
   * Get configuration entry
   * @param key - Name of the property
   * @param defaultValue - Default value
   * @returns Entry or default value
   */
  public static getEntry<T>(
    key: keyof T,
    defaultValue: string | null = null
  ): string | null {
    let result = Settings.configuration[String(key)];
    if (result != null && result != undefined) return result;
    return defaultValue;
  }

  /**
   * Set configuration entry
   * @param key - Name of the property
   * @param value - Value to set
   * @param persist - If the value will be persisted to file
   */
  public static async setEntry<T>(
    key: keyof T,
    value: string,
    persist: boolean = false
  ) {
    Logger.info("Setting configuration '" + String(key) + "'='" + value + "'");
    Settings.configuration[String(key)] = value;
    if (persist) {
      Logger.info("Persisting to config file");
      Backend.backend_call<[key: string, value: string], null>(
        "set_config",
        String(key),
        value
      );
    }
    Settings.notifyChanges();
  }

  /**
   * Inner method to notify configuration changes
   */
  private static async notifyChanges() {
    const data: SettingsEventData = new SettingsEventData({
      ...Settings.configuration,
    });
    EventBus.publishEvent(EventType.SETTINGS, data);
  }
}
