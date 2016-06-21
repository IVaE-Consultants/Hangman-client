import * as React from 'react';
import * as guess from './guess'
import * as main from './main'
import {Map} from 'immutable';

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

type AppAction = Action<Actions, any>;
type PageStates = Map<Page, any>;

const getPageState = (state: any) => (page : Page) : any =>
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
    return Result({
        page: Page.Main,
        pages: states,
    }, effect);
};

export const update = (state : any, action : AppAction) : any => {
    const pageState = getPageState(state);
    const {type, data} = action;
    if (type === Actions.Navigate) {
        const {data: navAction} = action;
        const {type: navType, data: page} = navAction;
        if(navType === PageActions.GoToPage) {
            state.page = page;
            return Result(state);
        }
    } else if (type === Actions.Delegate){
        const {type: pageName, data: pageAction} = data;
        // delegate to sub component
        const component : Component<any,any,any> = getPage(pageName);
        const componentState = pageState(pageName);
        const result = component.update(componentState, pageAction);
        // SCARY MUTATIONS!!!
        state.pages = state.pages.set(pageName, result.state);
        return Result(state);
    }
};

export const view = (state : any, next : (action : AppAction) => void) => {
    const {page} : {page : Page} = state;
    const component : Component<any, any, any> = getPage(page);
    console.log(component, page);
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


