
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

// repeat type
export enum RepeatType {
    // repeat active command, ineffeciently
    Loop,
    // repeat as argument run(arg)
    Accept,
    // not support repeat
    Reject,
}
