import * as React from 'react';
import * as guess from './guess'
import * as main from './main'
import {Record, Map} from 'immutable';

import {
    Effect,
    Action,
    Result,
    Component,
} from 'effectjs';

import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

import {Page, PageAction, Actions as PageActions} from './PageActions';

enum Actions {
    Delegate,
    Navigate,
}

const getPageState = (state: State) => (page : Page) : any =>
    state.pages.get(page);

const getPage = (page : Page) : Component<any, any, any> => {
    if (page === Page.Main) {
        return main;
    } else if(page === Page.Guess) {
        return guess;
    }
}

const delegateTo = (page : Page) => (action : Action<any, any>) =>
    Action(Actions.Delegate,Action(page, action));

type PageStates = Map<Page, any>;

interface StateAttrs {
    page?: Page;
    pages?: PageStates;
}

const State = Record<StateAttrs>({
    page: Page.Main,
    pages: Map() as PageStates,
});
type State = Record.IRecord<StateAttrs>;
type AppAction = Action<Actions, any>;
type AppResult = Result<State, AppAction>;

export const init = () => {
    const pages = [Page.Main, Page.Guess];
    const results = pages.map(page => {
        return getPage(page).init();
    });
    const effects = results.map((result, i) => {
        const page = pages[i];
        return result.effect.map(delegateTo(page));
    });
    const effect = Effect.all(effects);
    const states : PageStates = results.reduce((states, result, i) => {
        const page = pages[i]
        return states.set(page, result.state);
    }, Map() as PageStates);
    return Result(State({pages: states}), effect);
};

export const update = (state : any, action : AppAction) : AppResult => {
    const pageState = getPageState(state);
    const {type, data} = action;
    if (type === Actions.Navigate) {
        const {data: navAction} = action;
        const {type: navType, data: page} = navAction;
        if(navType === PageActions.GoToPage) {
            const nextState = state.merge({page});
            return Result(nextState);
        }
    } else if (type === Actions.Delegate){
        const {type: pageName, data: pageAction} = data;
        // delegate to sub component
        const component : Component<any,any,any> = getPage(pageName);
        const componentState = pageState(pageName);
        const result = component.update(componentState, pageAction);
        const pages = state.pages.set(pageName, result.state);
        const effect = result.effect.map(delegateTo(pageName));
        const nextState = state.merge({pages});
        return Result(nextState, effect);
    }
};

export const view = (state : any, next : (action : AppAction) => void) => {
    const {page} : {page : Page} = state;
    const component : Component<any, any, any> = getPage(page);
    const delegate = (subaction : Action<any, any>) => next(delegateTo(page)(subaction));
    const navigate = (navAction : PageAction) => next(Action(Actions.Navigate, navAction));
    const content = component.view(getPageState(state)(page), delegate, navigate);
    return (
        <View style={{
            flex:1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
        {content}
        </View>
   );
};

const component = {init, update, view} as Component<State, AppAction, any>;
