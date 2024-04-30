import { Utils } from "./utils"
import { EventType, EventData, EventSubscriptionInfo } from "../types/eventBus.types"

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