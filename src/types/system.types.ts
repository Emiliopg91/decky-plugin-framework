import { EventData } from "./eventBus.types";

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

export class SuspendEventData extends EventData {
    private _suspend: boolean;

    public constructor(isSuspend: boolean) {
        super()
        this._suspend = isSuspend
    }

    public isSuspend(): boolean {
        return this._suspend;
    }

    public isResume(): boolean {
        return !this._suspend;
    }
}