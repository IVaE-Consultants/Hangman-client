import {Action, Component} from 'effectjs';

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
    Guess
}

export type action = Action<Actions, {page : page, data? : any}> | Action<Actions, StatusCode>;

export const push = (page : page , data? : any) : action =>
    Action(Actions.PushPage, {page, data});

export const back = (statusCode : StatusCode = StatusCode.Success) : action =>
    Action(Actions.PopPage, statusCode);

