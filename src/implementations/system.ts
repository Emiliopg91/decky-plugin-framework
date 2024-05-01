import { EventBus } from "./eventBus";
import { EventType } from "../types/eventBus";
import { LoginEventData, NetworkEventData, SuspendEventData } from "../types/system";

/**
 * Class for access system information
 */
export class System {
    /**
     * Current user name
     */
    private static currentUser: string = "annonymous";

    /**
     * Unsubscriber function for Login changes
     */
    private static unregisterLogin: () => void;

    /**
     * Unsubscriber function for Suspend changes
     */
    private static unregisterSuspend: () => void;

    /**
     * Unsubscriber function for Resume changes
     */
    private static unregisterResume: () => void;

    /**
     * Unsubscriber function for network changes
     */
    private static unregisterNetworkState: () => void;

    /**
     * Interval function for network changes.
     */
    private static networkInterval: any;

    /**
     * Initialize class and subscriptions
     * @returns Promise for readiness
     */
    public static async initialize() {
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

        System.unregisterNetworkState = SteamClient.System.Network.RegisterForConnectionStateUpdate((e: any) => {
            const connected = e.eConnectivityTestResult === 0 || e.eConnectivityTestResult === 1
            EventBus.publishEvent(EventType.SUSPEND, new NetworkEventData(connected));
        }).unregister

        System.networkInterval = setInterval(() => { SteamClient.System.Network.ForceTestConnectivity() }, 10000)

        return promiseLogin;
    }

    /**
     * Stop subscriptions
     */
    public static stop() {
        clearInterval(System.networkInterval)
        System.unregisterLogin()
        System.unregisterSuspend()
        System.unregisterResume()
        System.unregisterNetworkState()
        EventBus.unsubscribeAll(EventType.SUSPEND)
        EventBus.unsubscribeAll(EventType.LOGIN)
    }

    /**
     * Get current language
     * @returns UI language
     */
    public static getLanguage(): string {
        return window.LocalizationManager.m_rgLocalesToUse[0];
    }

    /**
     * Get country for system based on IP
     * @returns Promise for IP Country
     */
    public static getIpCountry(): Promise<string> {
        return SteamClient.Settings.GetIPCountry()
    }

    /**
     * Get current username
     * @returns Username
     */
    public static getCurrentUser(): string {
        return this.currentUser;
    }
}