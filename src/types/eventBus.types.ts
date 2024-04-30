export enum EventType {
    GAME_LIFE,
    INPUT,
    SHORTCUT,
    SETTINGS,
    WHITEBOARD,
    SUSPEND,
    LOGIN
}

export abstract class EventData {
    private _emmitedOn: number = Date.now()

    public constructor() {
    }

    public getEmmitedOn(): number {
        return this._emmitedOn;
    }
}

export interface EventSubscriptionInfo {
    id: string
    unsubscribe: () => void
}