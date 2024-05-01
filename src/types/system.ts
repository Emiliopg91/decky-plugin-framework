import { EventData } from "./eventBus";

export class LoginEventData extends EventData {
    private _username: string;

    public constructor(username: string) {
        super()
        this._username = username
    }

    public getUsername(): string {
        return this._username;
    }
}

/**
 * Class for Suspend event
 */
export class SuspendEventData extends EventData {
    private _suspend: boolean;

    public constructor(isSuspend: boolean) {
        super()
        this._suspend = isSuspend
    }

    /**
     * If SteamDeck is suspending
     * @returns If is suspending
     */
    public isSuspend(): boolean {
        return this._suspend;
    }

    /**
     * If SteamDeck is resuming
     * @returns If is resuming
     */
    public isResume(): boolean {
        return !this._suspend;
    }
}