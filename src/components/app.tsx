import * as React from 'react';
import * as guess from './guess'
import * as main from './main'
import {Record, Map, Stack} from 'immutable';

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
    Back,
}


const getPage = (page : page) : Component<any, any, any> => {
    if (page === Page.page.Main) {
        return main;
    } else if(page === Page.page.Guess) {
        return guess;
    }
}

const delegateTo = (page : Component<any, any, any>) => (action : Action<any, any>) =>
    Action(Actions.Delegate,Action(page, action));


interface StateAttrs {
    pageStack? : Stack<StackElement>;
}

const State = Record<StateAttrs>({
    pageStack: Stack<StackElement>(),
});

interface StackElement {
    component? : Component<any, any,any>;
    state? : any;
}

const StackElem = (component : Component<any,any, any>, state : any) => {
    return Record<StackElement>({
        component,
        state,
    });
}

type StackRecord = Record.IRecord<StackElement>;
type state = Record.IRecord<StateAttrs>;
type action = Action<Actions, any>;
type result = Result<state, action>;

export const init = () => {
    const {state: initState, effect: mainEffects} = main.init();
    const mainPage = StackElem(main, initState)();
    let pageStack = Stack<StackElement>([mainPage]);
    const state = State({pageStack});

    //const pages = [page.Main, page.Guess];
    //const results = pages.map(page => {
    //    return getPage(page).init();
    //});
    const effect =  mainEffects.map(delegateTo(main));
    //const effects = results.map((result, i) => {
     //   const page = pages[i];
      //  return result.effect.map(delegateTo(page));
    //});
    //const effect = Effect.all(effects);
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {pageStack} = state;
    const {type, data} = action;
    if (type === Actions.Navigate) {
        const {data: navAction} = action;
        const {type: navType, data: page} = navAction;
        if(navType === Page.Actions.PushPage) {
            const {state: initState, effect} = page.component.init(page.data);
            const newStack = pageStack.push(StackElem(page.component, initState)());
            const nextState = state.merge({pageStack: newStack});
            return Result(nextState, effect);
        } else if(navType === Page.Actions.GoBack) {
            const newStack = pageStack.pop();
            const nextState = state.merge({pageStack: newStack});
            return Result(nextState);
        }
    } else if (type === Actions.Delegate){
        // TODO: handle delegate
        const {type: component, data: pageAction} = data;
        //const {state: componentState, action: pageAction} = actionData;
        // delegate to sub component
        // TODO: need function that gives the state for a given component, using peek to say that it will be the current page can cause race conditions
        const result = component.update(pageStack.peek().state, pageAction);
        //const pages = state.pages.set(pageName, result.state);
        const effect = result.effect.map(delegateTo(component));
        // TODO:find correct stack element and update it's state. Poping and pushing is not such a nice solution
        let newPageStack = pageStack.pop();
        const p = StackElem(component, result.state)();
        newPageStack = newPageStack.push(p);
        const nextState = state.merge({pageStack: newPageStack});
        return Result(nextState, effect);
    }
};

export const view = (state : state, next : (action : action) => void) => {
    const {pageStack} = state;
    const page = pageStack.peek();
    const component : Component<any, any, any> = page.component;
    const delegate = (subaction : Action<any, any>) => next(delegateTo(page.component)(subaction));
    const navigate = (navAction : Page.action) => next(Action(Actions.Navigate, navAction));
    const content = component.view(page.state, delegate, navigate);
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
