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


interface StateAttrs {
    pageStack? : OrderedMap<Page.page, StackElement>;
}

const State = Record<StateAttrs>({
    pageStack: OrderedMap<Page.page, StackElement>(),
});

interface StackElement {
    state? : any;
}

const StackElem = (state : any) => {
    return Record<StackElement>({
        state,
    });
}

type StackRecord = Record.IRecord<StackElement>;
type state = Record.IRecord<StateAttrs>;
type navigation = Action<Actions, Action<Page.Actions, Action<Page.page, any>>>;
type delegation = Action<Actions, Action<Page.page, Action<any,any>>>
type action = navigation | delegation;
type result = Result<state, action>;


export const init = () => {
    const {state: initState, effect: mainEffects} = main.init();
    const mainPage = StackElem(initState)();
    let pageStack = OrderedMap<Page.page, StackElement>([[Page.page.Main, mainPage]]);
    const state = State({pageStack});
    const effect =  mainEffects.map(delegateTo(Page.page.Main));
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {pageStack} = state;
    const {type} = action;
    console.log('action', action);
    if (type === Actions.Navigate) {
        console.log('navigate');
        const {data: navAction} = action as navigation;
        const {type: navType, data: pageAction} = navAction;
        if(navType === Page.Actions.PushPage) {
            const {type: page, data: state} = pageAction;
            const component = getComponent(page);
            const {state: initState, effect} = component.init(state);
            const newStack = pageStack.set(page, initState);
            const nextState = state.merge({pageStack: newStack});
            const t = effect.map(delegateTo(page));
            return Result(nextState, t);
        } else if(navType === Page.Actions.PopPage) {
            const page = pageStack.keys().next().value;
            const newStack = pageStack.delete(page);
            const nextState = state.merge({pageStack: newStack});
            return Result(nextState);
        }
    } else if (type === Actions.Delegate){
        console.log('delegate');
        const {data} = action as delegation;
        const {type: page, data: pageAction} = data;
        
        const component = getComponent(page);
        const {pageStack} = state;
        const stackElement = pageStack.get(page);
        const result = component.update(stackElement.state, pageAction);
        const effect = result.effect.map(delegateTo(page));
        const newStackElement = StackElem(result.state)();
        const newPageStack = pageStack.set(page, stackElement)
        const nextState = state.merge({pageStack: newPageStack});

        return Result(nextState, effect);
    } else {
        throw new Error('Invalid action type in app');
    }
};

export const view = (state : state, next : (action : action) => void) => {
    const {pageStack} = state;
    const [page, stackElement] = pageStack.entries().next().value;
    const component : Component<any, any, any> = getComponent(page);
    const delegate = (subaction : Action<any, any>) => next(delegateTo(page)(subaction));
    const navigate = (navAction : Page.action) => next(Action(Actions.Navigate, Action(page, navAction)));
    const content = component.view(stackElement.state, delegate, navigate);
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
