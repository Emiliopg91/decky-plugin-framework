import { Utils } from "./utils"

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

export class EventBus {
    private static subscribers: Record<EventType, Record<string, ((e: EventData) => void)>> = {
        [EventType.GAME_LIFE]: {},
        [EventType.INPUT]: {},
        [EventType.SHORTCUT]: {},
        [EventType.SETTINGS]: {},
        [EventType.WHITEBOARD]: {},
        [EventType.SUSPEND]: {},
        [EventType.LOGIN]: {}
    }

    public static async publishEvent(type: EventType, data: EventData) {
        Object.keys(EventBus.subscribers[type]).forEach((id) => {
            EventBus.subscribers[type][id](data);
        })
    }

    public static subscribe(type: EventType, callback: (e: EventData) => void): EventSubscriptionInfo {
        const id = Utils.generateId(Object.keys(EventBus.subscribers[type]));
        this.subscribers[type][id] = callback;
        return {
            id, unsubscribe: () => {
                delete EventBus.subscribers[type][id];
            }
        }
    }

    public static unsubscribeAll(type: EventType) {
        this.subscribers[type] = {};
    }
}