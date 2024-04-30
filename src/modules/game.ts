import { LifetimeNotification, Router } from "decky-frontend-lib";
import { EventBus, EventData, EventType } from "./eventBus"


export class GameEntry {
    private _gameId: number;

    public constructor(gameId: number) {
        this._gameId = gameId;
    }

    public getGameId(): number {
        return this._gameId;
    }

    public getDisplayName(): boolean {
        return appStore.GetAppOverviewByGameID(this._gameId)?.display_name
    }

    public isSteamGame(): boolean {
        return appStore.GetAppOverviewByGameID(this._gameId)?.app_type === 1
    }

    public allowsCloudSave(): boolean {
        return appStore.GetAppOverviewByGameID(this._gameId)?.local_per_client_data?.cloud_status !== 1
    }
}

export class GameLifeEventData extends EventData {
    private _isRunning: boolean;
    private _pid: number;
    private _gameId: number;

    public constructor(gameId: number, isRunning: boolean, pid: number) {
        super()
        this._gameId = gameId
        this._isRunning = isRunning
        this._pid = pid
    }

    public getGameId(): number {
        return this._gameId;
    }

    public isRunning(): boolean {
        return this._isRunning;
    }

    public isStopped(): boolean {
        return !this._isRunning;
    }

    public getPID(): number {
        return this._pid;
    }

    public getDetails() {
        return Game.getGameDetails(this._gameId);
    }
}

declare const appStore: any;

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