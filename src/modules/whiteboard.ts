import { useState } from "react";
import { EventBus, EventData, EventType } from "./eventBus";

export class WhiteBoardEventData extends EventData {
    private _id: string;
    private _value: any;

    public constructor(id: string, value: any) {
        super();
        this._id = id;
        this._value = value;
    }

    public getId(): string {
        return this._id;
    }
    public getValue(): any {
        return this._value;
    }

}

interface WhiteBoardEntry {
    object: any
    setter: React.Dispatch<React.SetStateAction<any>>
}

export class WhiteBoard {

    private static entries: Record<string, WhiteBoardEntry> = {}

    public static stop() {
        WhiteBoard.removeAll()
        EventBus.unsubscribeAll(EventType.WHITEBOARD)
    }

    public static set<T>(id: string, value: T) {
        const entry = WhiteBoard.entries[id]
        if (entry === null || entry === undefined) {
            const [object, setter] = useState<T>(value)
            WhiteBoard.entries[id] = { object, setter }
        } else {
            entry.setter(value)
        }
        this.publishEvent<T>(id, value);
    }

    public static get<T>(id: string): T | null {
        const entry = WhiteBoard.entries[id]
        if (entry === undefined) {
            return null;
        } else {
            return entry.object;
        }
    }

    public static remove(id: string) {
        delete WhiteBoard.entries[id]
        this.publishEvent(id, null);
    }

    public static removeAll() {
        WhiteBoard.entries = {}
    }

    private static publishEvent<T>(id: string, value: T) {
        EventBus.publishEvent(EventType.WHITEBOARD, new WhiteBoardEventData(id, value))
    }
}