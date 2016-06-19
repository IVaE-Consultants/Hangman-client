const {Action} = require('effectjs');

export const enum Actions {
    GoToPage,
}

export const enum Page {
    Main,
    Guess
}

export interface Action<K,V> {
    type : K;
    data : V;
}

export type PageAction = Action<Actions, Page>;

export const goToPage : (pagename : Page) => PageAction
    = (pagename) => Action(Actions.GoToPage, pagename);

