import { LifetimeNotification, Router } from "decky-frontend-lib";
import { EventBus } from "./eventBus"
import { EventType } from "../types/eventBus";
import { GameLifeEventData, GameEntry } from "../types/game";

/**
 * Class for access game information
 */
export class Game {
    /**
     * Private constructor to prevent instantiation
     */
    private constructor() { }

    /**
     * Unsubscriber for Game Lifetime Notifications
     */
    private static unsubscriber: () => void

    /**
     * Initialize class
     */
    public static initialize() {
        this.unsubscriber = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
            const data: GameLifeEventData = new GameLifeEventData(e.unAppID, e.bRunning, e.nInstanceID)
            EventBus.publishEvent(EventType.GAME_LIFE, data);
        }).unregister;
    }

    /**
     * Stop subscriptions
     */
    public static stop() {
        Game.unsubscriber()
        EventBus.unsubscribeAll(EventType.GAME_LIFE)
    }

    /**
     * Get details for specified game
     * @param gameId - Id of game
     * @returns Details entry of game
     */
    public static getGameDetails(gameId: number): GameEntry {
        return new GameEntry(gameId)
    }

    /**
     * Get all running games
     * @returns List of running game details
     */
    public static getRunningGames(): Array<GameEntry> {
        let result: Array<GameEntry> = []

        Router.RunningApps.forEach((g) => {
            const entry: GameEntry = new GameEntry(Number(g.appid))
            result.push(entry);
        })

        return result;
    }
}