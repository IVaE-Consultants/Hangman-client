import {Action} from 'effectjs';

export const enum Actions {
    GoToPage,
}

export const enum Page {
    Main,
    Guess
}

export type PageAction = Action<Actions, Page>;

export const goToPage : (pagename : Page) => PageAction
    = (pagename) => Action(Actions.GoToPage, pagename);

