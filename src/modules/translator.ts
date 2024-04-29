import { Logger } from "./logger";

/**
 * Represents supported languages.
 */
export enum Language {
    english,
    spanish,
    latam,
    french,
    portuguese,
    german
}

/**
 * The Translator class is used to translate text into different languages.
 */
export class Translator {

    /**
     * Private constructor to prevent instantiation
     */
    private constructor() {
    }

    /**
     * The dictionary of the current language.
     */
    private static currDictionary: Record<string, string> | undefined = {};

    /**
     * Method to set up the translator. It retrieves the current language from the SteamClient.Settings,
     * logs the language, and sets the currDictionary to the dictionary of the current language.
     * If the current language is not English and no translation is available, it falls back to English.
     */
    public static async initialize(defaultLanguage: Language, allDictionaries: { [key in Language]?: Record<string, string> }) {
        let currLang = await SteamClient.Settings.GetCurrentLanguage();
        Logger.info("Initializing translator for " + currLang);
        const langKey = currLang.toLowerCase() as keyof typeof Language;
        const lang = Language[langKey] || Language.english;

        Translator.currDictionary = allDictionaries[defaultLanguage];
        if (currLang != "english" && lang == Language.english) {
            Logger.warn("No translator available, fallback to " + Language[defaultLanguage]);
        } else {
            Translator.currDictionary = { ...Translator.currDictionary, ...allDictionaries[lang] };
        }
    }

    /**
     * Method to translate a given text into the current language.
     * @param text - The text to translate
     * @param replacements - An object that contains key-value pairs to replace in the text
     * @returns The translated text. If a translation for a text is not found in the current dictionary, the original text is returned.
     */
    public static translate(text: string, replacements: Record<string, any> = {}) {
        let result: string = text;
        if (Translator.currDictionary !== null && Translator.currDictionary !== undefined && Translator.currDictionary[text] !== null && Translator.currDictionary[text] !== undefined) {
            result = Translator.currDictionary[text];
            for (const key in replacements) {
                const placeholder = `{{${key}}}`;
                result = result.split(placeholder).join(replacements[key])
            }
        } else {
            Logger.warn("Missing translation for " + text);
        }
        return result;
    }
}
export default Translator;