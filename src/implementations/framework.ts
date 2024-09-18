import { Logger } from "./logger";
import { Toast } from "./toast";
import { Translator } from "./translator";
import { Settings } from "./settings";
import { Game } from "./game";
import { InputListener, ShortcutListener } from "./input";
import { WhiteBoard } from "./whiteboard";
import { System } from "./system";

/**
 * Wrapper class for initialitate and shutdown framework
 */
export class Framework {
    /**
     * Private to prevent instantiation
     */
    private constructor() { }

    /**
     * Initialize framework
     * @param serverApi - ServerApi for plugin
     * @param pluginName - Plugin name
     * @param pluginVersion - Plugin version
     * @param translations - Map of translations
     */
    public static async initialize(pluginName: string, pluginVersion: string, translations: Record<string, Record<string, string>>) {
        await System.initialize()
        await Toast.initialize(pluginName)
        await Logger.initialize(pluginName)
        await Settings.initialize()
        await Translator.initialize(translations)
        await Game.initialize()
        await InputListener.initialize()
        await ShortcutListener.initialize()

        Logger.info("Started plugin " + pluginName + " v" + pluginVersion);
    }

    /**
     * Shutdown framework
     */
    public static async shutdown() {
        await Game.stop()
        await InputListener.stop()
        await ShortcutListener.stop()
        await Settings.stop()
        await WhiteBoard.stop()
        await System.stop()

        Logger.info("Stopped plugin");
    }
}