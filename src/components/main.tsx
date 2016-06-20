import * as React from 'react';
import {Record, Map} from 'immutable';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction} from './PageActions';

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

enum Actions {
    Increment,
}

interface State {
    x: number;
    y: number;
}
const defaultState = Record<State>({
    x: 1,
    y: 2,
});
type StateRecord = Record.IRecord<State>;
type MainAction = Action<Actions, any>;
type MainResult = Result<StateRecord, Effect<MainAction>>;

export const init = () : MainResult => {
    return Result(defaultState({y: 3}), Effect.none);
};

export const update = (state : StateRecord, action : MainAction) : MainResult => {
    if(action.type === Actions.Increment) {
        const {x, y} = state;
        const nextState = state.set('x', x+1);
        return Result(nextState);
    }
};

export const view = (state : State, next : (action : MainAction) => void, navigate : (action : PageAction) => void) => {
    return (
    <TouchableHighlight onPress={()=> {navigate(goToPage(Page.Guess))}}>
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 250,
            height: 150,
            backgroundColor: 'green',
        }} >
            <Text>This is main view</Text>
        </View>
    </TouchableHighlight>
   );
};
