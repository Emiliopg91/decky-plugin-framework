import { Router } from "decky-frontend-lib";
import { Logger } from "./logger";
import { EventBus } from "./eventBus";
import { Button, InputEventData, ShortcutEventData } from "../types/input.types"
import { EventData, EventType } from "../types/eventBus.types";

export class InputListener {

    private static inputRegister: any = null;
    private static previousState: Array<Button> = []

    public static initialize() {
        if (!InputListener.inputRegister) {
            InputListener.inputRegister = SteamClient.Input.RegisterForControllerStateChanges((changes: any[]) => {
                const currentState: Array<Button> = [];
                for (const change of changes) {
                    const lower_buttons = change.ulButtons.toString(2).padStart(32, "0").split('');
                    for (const [index, value] of lower_buttons.entries()) {
                        if (value === '1') {
                            currentState.push(31 - index as Button)
                        }
                    }
                    const upper_buttons = change.ulUpperButtons.toString(2).padStart(32, "0").split('');
                    for (const [index, value] of upper_buttons.entries()) {
                        if (value === '1') {
                            currentState.push(63 - index as Button)
                        }
                    }
                }

                let hasChanged = !currentState.every((button) => InputListener.previousState.includes(button))
                    || !InputListener.previousState.every((button) => currentState.includes(button));

                if (hasChanged) {
                    InputListener.previousState = currentState;
                    const data: InputEventData = new InputEventData(currentState)
                    EventBus.publishEvent(EventType.INPUT, data)
                    Logger.debug("Pressed inputs: " + data.toString());
                }
            });
        }
    }

    public static stop() {
        InputListener.inputRegister?.unregister();
        EventBus.unsubscribeAll(EventType.INPUT);
    }
}

interface ShortcutDefinition {
    buttons: Array<Button>
    pressed: boolean
    time: number
    qamAndSteamDisabled: boolean
}

export class ShortcutListener {
    private static definitions: Record<string, ShortcutDefinition> = {}

    public static initialize() {
        EventBus.subscribe(EventType.INPUT, ShortcutListener.onKeyEvent);
    }

    public static stop() {
        ShortcutListener.definitions = {};
        EventBus.unsubscribeAll(EventType.SHORTCUT)
    }

    public static watch(id: string, buttons: Array<Button>) {
        ShortcutListener.definitions[id] = { buttons, pressed: false, time: Date.now(), qamAndSteamDisabled: false };
    }

    private static onKeyEvent(data: EventData) {
        const buttons = (data as InputEventData).getButtons();
        Object.keys(ShortcutListener.definitions).forEach((id) => {
            const shortcut = ShortcutListener.definitions[id];

            if (shortcut.buttons.length === buttons.length && shortcut.buttons.every((value) => buttons.includes(value))) {
                if (shortcut.pressed != true && Date.now() - shortcut.time > 350) {
                    if (buttons.includes(Button.QUICK_ACCESS_MENU) || buttons.includes(Button.STEAM)) {
                        (Router as any).DisableHomeAndQuickAccessButtons();
                        shortcut.qamAndSteamDisabled = true
                        shortcut.pressed = true;
                    }
                    shortcut.time = Date.now();
                    shortcut.pressed = true;
                    const data: ShortcutEventData = new ShortcutEventData([...shortcut.buttons], id, true)
                    EventBus.publishEvent(EventType.SHORTCUT, data);
                    Logger.debug("Pressed shortcut: " + data.toString());
                }
            } else {
                if (shortcut.qamAndSteamDisabled &&
                    (!buttons.includes(Button.QUICK_ACCESS_MENU) || !buttons.includes(Button.STEAM))) {
                    shortcut.qamAndSteamDisabled = false;
                    setTimeout(() => {
                        let reenable: boolean = true;
                        Object.keys(ShortcutListener.definitions).forEach((id) => {
                            reenable = reenable && ShortcutListener.definitions[id].qamAndSteamDisabled;
                        });
                        if (reenable) {
                            (Router as any).EnableHomeAndQuickAccessButtons();
                        }
                    }, 350);
                }
                if (shortcut.pressed != false) {
                    shortcut.pressed = false;
                    const data: ShortcutEventData = new ShortcutEventData([...shortcut.buttons], id, false)
                    EventBus.publishEvent(EventType.SHORTCUT, data);
                    Logger.debug("Released shortcut: " + data.toString);
                }
            }
        });
    }
}