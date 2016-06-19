import * as React from 'react';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction} from './PageActions';

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

enum Actions {
}

type State = number
type MainAction = Action<Actions, any>;
type MainResult = Result<State, Effect<MainAction>>;

export const init = () : MainResult => {
    return Result(2, Effect.none);
};

export const update = (state : State, action : MainAction) : MainResult => {
    return Result(state);
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
