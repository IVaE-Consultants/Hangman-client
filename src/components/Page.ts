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

export type pushAction = Action<Actions, Action<page, any>>;
export type popAction = Action<Actions, StatusCode>;
export type action = pushAction | popAction;

export const push = (page : page , data? : any ) : pushAction => 
    Action(Actions.PushPage, Action(page, data));

export const pop = (statusCode : StatusCode = StatusCode.Success) : popAction =>
    Action(Actions.PopPage, statusCode);

