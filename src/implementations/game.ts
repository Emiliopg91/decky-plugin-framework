import { LifetimeNotification, Router } from "decky-frontend-lib";
import { EventBus } from "./eventBus"
import { EventType } from "../types/eventBus.types";
import { GameLifeEventData, GameEntry } from "../types/game.types";

export class Game {
    private constructor() { }

    public static initialize() {
        SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
            const data: GameLifeEventData = new GameLifeEventData(e.unAppID, e.bRunning, e.nInstanceID)
            EventBus.publishEvent(EventType.GAME_LIFE, data);
        });
    }

    public static stop() {
        EventBus.unsubscribeAll(EventType.GAME_LIFE)
    }

    public static getGameDetails(gameId: number): GameEntry {
        return new GameEntry(gameId)
    }

    public static getRunningGames(): Array<GameEntry> {
        let result: Array<GameEntry> = []

        Router.RunningApps.forEach((g) => {
            const entry: GameEntry = new GameEntry(Number(g.appid))
            result.push(entry);
        })

        return result;
    }
}