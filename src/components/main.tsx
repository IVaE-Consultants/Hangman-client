import * as React from 'react';
import {Record, Map} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';
import {Page, goToPage, PageAction} from './PageActions';
import {perform} from '../utils';

enum Actions {
    Increment,
}

interface StateAttrs {
    x?: number;
    y?: number;
}
const State = Record<StateAttrs>({
    x: 1,
    y: 2,
});

type State = Record.IRecord<StateAttrs>;
type MainAction = Action<Actions, any>;
type MainResult = Result<State, MainAction>;

const delay = (ms : number) : Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}

const increment = Action(Actions.Increment);

export const init = () : MainResult => {
    const state = State();
    const promise = delay(1000);
    const effect = perform(promise, () => increment, (error) => increment);
    return Result(state, effect);
};

export const update = (state : State, action : MainAction) : MainResult => {
    if(action.type === Actions.Increment) {
        const {x, y} = state;
        const nextState = state.merge({y: y + 1});
        return Result(nextState);
    }
};

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

export const view = (state : State, next : (action : MainAction) => void, navigate : (action : PageAction) => void) => {
    const {y} = state;
    return (
    <TouchableHighlight onPress={()=> {navigate(goToPage(Page.Guess))}}>
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 250,
            height: 150,
            backgroundColor: 'green',
        }} >
        <Text>{y}</Text>
        </View>
    </TouchableHighlight>
   );
};

const component = {init,update,view} as Component<State, MainAction, any>;
