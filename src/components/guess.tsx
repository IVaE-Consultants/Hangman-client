import * as React from 'react';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction, Actions as PageActions} from './PageActions';

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

const enum Actions {
    GuessLetter,
}

type State = {};
type Letter = 'A';
type GuessAction = Action<Actions,Letter>;
type GuessResult = Result<State,Effect<GuessAction>>;

export const init = () : GuessResult => {
    return Result({}, Effect.none);
};

export const update = (state : State, action : GuessAction) : GuessResult => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        //Evaluate if correct or not
        //then return a new state
        return Result(state, Effect.none);
    }
};

export const view = (state : State, next : (action : GuessAction) => void, navigate : (action : PageAction) => void) => {
    return (
        <TouchableHighlight onPress={()=> {navigate(goToPage(Page.Main))}}>
            <View style={{
                alignSelf: 'center',
                justifyContent: 'center',
                width: 250,
                height: 150,
                backgroundColor: 'green',
            }} >
                <Text>This is guess view</Text>
            </View>
        </TouchableHighlight>
   );
};
