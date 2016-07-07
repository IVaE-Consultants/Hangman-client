import * as React from 'react';
import * as guess from './guess'
import * as main from './main'
import {Record, Map, Stack, OrderedMap} from 'immutable';


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

import * as Page from './Page';
import {page} from './Page';

enum Actions {
    Delegate,
    Navigate,
}

const getComponent = (page : page) : Component<any, any, any> => {
    if (page === Page.page.Main) {
        return main;
    } else if(page === Page.page.Guess) {
        return guess;
    }
}

const delegateTo = (page : Page.page) => (action : Action<any, any>) =>
    Action(Actions.Delegate, Action(page, action));

interface IPageState {
    state? : any;
}

type PageState = Record.IRecord<IPageState>;
const PageState = (state : any) : Record.Factory<IPageState> => {
    return Record<IPageState>({
        state,
    });
}
interface StateAttrs {
    states? : Map<Page.page, PageState>;
    pageStack? : Stack<Page.page>
}
const State = Record<StateAttrs>({
    pageStack: Stack<Page.page>(),
    states: Map<Page.page, PageState>(),
});


type state = Record.IRecord<StateAttrs>;
type navigation = Action<Actions, Page.pushAction>
    | Action<Actions, Page.popAction>;
type delegation = Action<Actions, Action<Page.page, Action<any,any>>>
type action = navigation | delegation;
type result = Result<state, action>;


export const init = () => {
    const {state: initState, effect: mainEffects} = main.init();
    const mainPage = PageState(initState)();
    const pageStack = Stack<Page.page>([Page.page.Main]);
    const states = Map<Page.page, PageState>([[Page.page.Main, mainPage]]);
    const state = State({pageStack, states});
    const effect =  mainEffects.map(delegateTo(Page.page.Main));
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {pageStack, states} = state;
    const {type} = action;
    if (type === Actions.Navigate) {
        const {data: navAction} = action as navigation;
        if(navAction.type === Page.Actions.PushPage) {
            const {data: pageAction} = navAction as Page.pushAction;
            const {type: page, data: pageState} = pageAction;
            const component = getComponent(page);
            const {state: initState, effect} = component.init(pageState);
            const nextPageState = PageState(initState)();
            const newStack = pageStack.push(page);
            const newStates = states.set(page, nextPageState);
            const nextState = state.merge({
                pageStack: newStack,
                states: newStates,
            });
            return Result(nextState, effect.map(delegateTo(page)));
        } else if(navAction.type === Page.Actions.PopPage) {
            const {data: pageAction} = navAction as Page.popAction;
            const page = pageStack.peek();
            const newStack = pageStack.pop();
            const newStates = states.delete(page);
            const nextState = state.merge({
                pageStack: newStack,
                states: newStates,
            });
            return Result(nextState);
        }
    } else if (type === Actions.Delegate){
        const {data} = action as delegation;
        const {type: page, data: pageAction} = data;
        const component = getComponent(page);
        const {states} = state;
        const pageState = states.get(page);
        if(pageState) {
            const result = component.update(pageState.state, pageAction);
            const effect = result.effect.map(delegateTo(page));
            const newPageState = PageState(result.state)();
            const newStates = states.set(page, newPageState);
            const nextState = state.merge({
                states: newStates,
            });
            return Result(nextState, effect);
        } else {
            return Result(state);
        }
    } else {
        throw new Error('Invalid action type in app');
    }
};

export const view = (state : state, next : (action : action) => void) => {
    const {pageStack, states} = state;
    const page = pageStack.peek();
    const pageState = states.get(page);
    const component = getComponent(page);
    const delegate = (subaction : Action<any, any>) => next(delegateTo(page)(subaction));
    const navigate = (navAction : Page.action) => {
        const navigation = Action(Actions.Navigate, navAction);
        next(navigation as navigation);
    };
    const content = component.view(pageState.state, delegate, navigate);
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

const component = {init, update, view} as Component<state, action, any>;
