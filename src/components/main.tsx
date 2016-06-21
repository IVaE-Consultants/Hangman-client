import * as React from 'react';
import {Record, Map} from 'immutable';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction} from './PageActions';

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
type MainResult = Result<State, Effect<MainAction>>;

export const init = () : MainResult => {
    const state = State();
    return Result(state, Effect.none);
};

export const update = (state : State, action : MainAction) : MainResult => {
    if(action.type === Actions.Increment) {
        const {x, y} = state;
        const nextState = state.merge({y: 2});
        return Result(nextState);
    }
};

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

export const view = (state : State, next : (action : MainAction) => void, navigate : (action : PageAction) => void) => {
    const {x,y} = state;
    return (
    <TouchableHighlight onPress={()=> {navigate(goToPage(Page.Guess))}}>
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 250,
            height: 150,
            backgroundColor: 'green',
        }} >
            <Text>This is main view {x} {y}</Text>
        </View>
    </TouchableHighlight>
   );
};
