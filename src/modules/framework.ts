import { Backend } from "./backend";
import { Logger } from "./logger";
import { Language, Translator } from "./translator";
import { Configuration } from "./configuration";
import { ServerAPI } from "decky-frontend-lib";

export class Framework {
    private constructor() { }

    public static async initialize(serverApi: ServerAPI, pluginName: string, pluginVersion: string, defaultLang: Language, languages: { [key in Language]?: Record<string, string> }) {
        Backend.initialize(serverApi);
        await Logger.initialize(pluginName)
        await Configuration.initialize()
        await Translator.initialize(defaultLang, languages)

        Logger.info("Started plugin " + pluginName + " v" + pluginVersion);
    }
}
export default Framework;