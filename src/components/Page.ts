import {Action, Component} from 'effectjs';

export const enum Actions {
    GoBack,
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

export type action = Action<Actions, {component : any, data? : any}> | Action<Actions, StatusCode>;

export const push = (component : Component<any, any, any>, data? : any) : action =>
    Action(Actions.PushPage, {component, data});

export const back = (statusCode : StatusCode = StatusCode.Success) : action =>
    Action(Actions.GoBack, statusCode);

