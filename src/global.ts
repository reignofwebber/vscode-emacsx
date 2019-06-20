
// emacs modes (NOT IMPLEMENT YET)
export enum Mode {
    Global,
    Fundemental
}

// repeat structure
export interface IRepeat {
    num: number;
    repeatByNumber: boolean;
}

// command initial config
export interface ICmdConfig {
    // command key binding
    name: string;
    // if emacs trace this command, default `true`.
    trace?: boolean;
    // if this command modify text. default `false`
    modify?: boolean;
}