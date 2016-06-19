import * as React from 'react';
import * as guess from './guess'
import * as main from './main'

const {
    Effect,
    Action,
    Result,
} = require('effectjs');

import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

import {Page, PageAction, Actions as PageActions} from './PageActions';

enum Actions {
    SubAction,
    Navigate,
}

import {ComponentT, EffectT, ResultT, ActionT} from './EffectTypes';

type AppAction = ActionT<Actions, any>;

const getPageState = (state: any) => (page : Page) : any =>
    state[page];

const pages = (page : Page) : ComponentT<any, any, any> => {
    if (page === Page.Main) {
        return main;
    } else if(page === Page.Guess) {
        return guess;
    }
}

export const init = () => {
    return Result({
        page: Page.Main,
        [Page.Main]: pages(Page.Main).init().state,
        [Page.Guess]: pages(Page.Guess).init().state,
    }, Effect.none);
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
    } else if (type === Actions.SubAction){
        const {type: pageName, data: pageAction} = data;
        // delegate to sub component
        const component : ComponentT<any,any,any> = pages(pageName);
        const componentState = pageState(pageName);
        const result = component.update(componentState, pageAction);
        state[pageName] = result.state;
        return Result(state);
    }
};

export const view = (state : any, next : (action : AppAction) => void) => {
    const {page} : {page : Page} = state;
    const component : ComponentT<any, any, any> = pages(page);
    const delegate = (subaction : ActionT<any, any>) => next(Action(page, subaction));
    const navigate = (navAction : PageAction) => next(Action(Actions.Navigate, navAction));
    const content = component.view(state[page], delegate, navigate);
    return (
        <View style={{flex:1}}>
        {content}
        </View>
   );
};


