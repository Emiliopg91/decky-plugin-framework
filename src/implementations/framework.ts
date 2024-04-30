import { ServerAPI } from "decky-frontend-lib";
import { Backend } from "./backend";
import { Logger } from "./logger";
import { Toast } from "./toast";
import { Translator } from "./translator";
import { Settings } from "./settings";
import { Game } from "./game";
import { InputListener, ShortcutListener } from "./input";
import { WhiteBoard } from "./whiteboard";
import { System } from "./system";

export class Framework {
    private constructor() { }

    public static async initialize(serverApi: ServerAPI, pluginName: string, pluginVersion: string, translations: Record<string, Record<string, string>>) {
        await System.initialize()
        await Backend.initialize(serverApi);
        await Toast.initialize(pluginName, serverApi)
        await Logger.initialize(pluginName)
        await Settings.initialize()
        await Translator.initialize(translations)
        await Game.initialize()
        await InputListener.initialize()
        await ShortcutListener.initialize()

        Logger.info("Started plugin " + pluginName + " v" + pluginVersion);
    }

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