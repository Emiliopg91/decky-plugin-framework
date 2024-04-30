import { EventBus, EventData, EventType } from "./eventBus";

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

export class System {
    private static currentUser: string = "annonymous";

    private static unregisterLogin: () => void;
    private static unregisterSuspend: () => void;
    private static unregisterResume: () => void;

    public static initialize(): Promise<void> {
        const promiseLogin = new Promise<void>((resolve) => {
            System.unregisterLogin = SteamClient.User.RegisterForLoginStateChange((username: string) => {
                System.currentUser = username;
                EventBus.publishEvent(EventType.LOGIN, new LoginEventData(username));
                resolve();
            }).unregister
        });

        System.unregisterSuspend = SteamClient.System.RegisterForOnSuspendRequest(() => {
            EventBus.publishEvent(EventType.SUSPEND, new SuspendEventData(true));
        }).unregister

        System.unregisterResume = SteamClient.System.RegisterForOnResumeFromSuspend(() => {
            EventBus.publishEvent(EventType.SUSPEND, new SuspendEventData(false));
        }).unregister

        return promiseLogin;
    }

    public static stop() {
        System.unregisterLogin()
        System.unregisterSuspend()
        System.unregisterResume()
        EventBus.unsubscribeAll(EventType.SUSPEND)
        EventBus.unsubscribeAll(EventType.LOGIN)
    }

    public static getLanguage(): string {
        return window.LocalizationManager.m_rgLocalesToUse[0];
    }

    public static getIpCountry(): Promise<string> {
        return SteamClient.Settings.GetIPCountry()
    }

    public static getCurrentUser(): string {
        return this.currentUser;
    }
}