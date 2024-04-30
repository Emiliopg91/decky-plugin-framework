import { Router } from "decky-frontend-lib";
import { Logger } from "./logger";
import { EventBus, EventData, EventType } from "./eventBus";

export const enum Button {
    SELECT = 12,
    STEAM = 13,
    START = 14,
    QUICK_ACCESS_MENU = 50,
    DPAD_UP = 8,
    DPAD_RIGHT = 9,
    DPAD_LEFT = 10,
    DPAD_DOWN = 11,
    Y = 4,
    B = 5,
    X = 6,
    A = 7,
    L1 = 3,
    L2 = 1,
    L3 = 22,
    L4 = 41,
    L5 = 15,
    R1 = 2,
    R2 = 0,
    R3 = 26,
    R4 = 42,
    R5 = 16,
    LEFT_TOUCHPAD_CLICK = 17,
    RIGHT_TOUCHPAD_CLICK = 18,
    LEFT_TOUCHPAD_TOUCH = 19,
    RIGHT_TOUCHPAD_TOUCH = 20,
    LEFT_JOYSTICK_TOUCH = 46,
    RIGHT_JOYSTICK_TOUCH = 47,
}

const buttonAliases: Record<Button, string> = {
    [Button.SELECT]: "SELECT",
    [Button.STEAM]: "STEAM",
    [Button.START]: "START",
    [Button.QUICK_ACCESS_MENU]: "QUICK_ACCESS_MENU",
    [Button.DPAD_UP]: "DPAD_UP",
    [Button.DPAD_RIGHT]: "DPAD_RIGHT",
    [Button.DPAD_LEFT]: "DPAD_LEFT",
    [Button.DPAD_DOWN]: "DPAD_DOWN",
    [Button.Y]: "Y",
    [Button.B]: "B",
    [Button.X]: "X",
    [Button.A]: "A",
    [Button.L1]: "L1",
    [Button.L2]: "L2",
    [Button.L3]: "L3",
    [Button.L4]: "L4",
    [Button.L5]: "L5",
    [Button.R1]: "R1",
    [Button.R2]: "R2",
    [Button.R3]: "R3",
    [Button.R4]: "R4",
    [Button.R5]: "R5",
    [Button.LEFT_TOUCHPAD_CLICK]: "LEFT_TOUCHPAD_CLICK",
    [Button.RIGHT_TOUCHPAD_CLICK]: "RIGHT_TOUCHPAD_CLICK",
    [Button.LEFT_TOUCHPAD_TOUCH]: "LEFT_TOUCHPAD_TOUCH",
    [Button.RIGHT_TOUCHPAD_TOUCH]: "RIGHT_TOUCHPAD_TOUCH",
    [Button.LEFT_JOYSTICK_TOUCH]: "LEFT_JOYSTICK_TOUCH",
    [Button.RIGHT_JOYSTICK_TOUCH]: "RIGHT_JOYSTICK_TOUCH"
}

export class InputEventData extends EventData {
    private _buttons: Array<Button>;

    public constructor(buttons: Array<Button>) {
        super()
        this._buttons = buttons
    }

    public getButtons(): Array<Button> {
        return this._buttons;
    }

    public toString(): string {
        let line = "[";
        this._buttons.forEach(button => line = line + buttonAliases[button] + ", ")
        if (line.endsWith(", ")) {
            line = line.slice(0, -2);
        }
        line = line + "]";
        return line;
    }
}

export class ShortcutEventData extends InputEventData {
    private _id: string;
    private _pressed: boolean;

    public constructor(buttons: Array<Button>, id: string, pressed: boolean) {
        super(buttons);
        this._id = id;
        this._pressed = pressed;
    }

    public getId(): string {
        return this._id;
    }

    public isPressed(): boolean {
        return this._pressed;
    }

    public isFor(buttons: Array<Button>): boolean {
        return this.getButtons().length === buttons.length && this.getButtons().every((value) => buttons.includes(value))
    }
}

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