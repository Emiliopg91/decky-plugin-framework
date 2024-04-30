import { EventData } from "./eventBus.types"

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