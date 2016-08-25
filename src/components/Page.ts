import {Action, Component, Effect, Reply} from 'effectjs';

export const enum Actions {
    PopPage,
    PushPage,
}

export const enum StatusCode {
    Success,
    Fail,
}

export const enum page {
    Main,
    Guess,
    CreateWord,
    LetterSelector
}

export type pushAction = Action<Actions, Action<page, any>>;
export type popAction = Action<Actions, StatusCode>;
export type action = pushAction | popAction;
export const reply = 'reply';

export const push = (page : page , data? : any, reply = ((action : any) => Effect.none)) : pushAction =>
    Action(Actions.PushPage, Action(page, {data, reply}));

export const pop = (statusCode : StatusCode = StatusCode.Success) : popAction =>
    Action(Actions.PopPage, statusCode);

