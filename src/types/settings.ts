import { EventData } from "./eventBus"

/**
 * Class for settings events
 */
export class SettingsEventData extends EventData {
    private _settings: Record<string, string>

    public constructor(settings: Record<string, string>) {
        super()
        this._settings = settings;
    }

    /**
     * Get new settings
     * @returns New settings
     */
    public getSettings(): Record<string, string> {
        return this._settings;
    }
}