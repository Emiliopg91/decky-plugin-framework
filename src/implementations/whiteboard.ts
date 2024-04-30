import { useState } from "react";
import { EventBus } from "./eventBus";
import { EventType } from "../types/eventBus.types";
import { WhiteBoardEventData } from "../types/whiteboard.types";

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