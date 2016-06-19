import * as React from 'react';
const {Action, Effect, Result} = require('effectjs');
import {Page, goToPage, PageAction, Action} from './PageActions';
import {ResultT, EffectT} from './EffectTypes';

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

const enum Actions {
    GuessLetter,
}

type Letter = 'A';
type GuessAction = Action<Actions,Letter>;
type OutAction = GuessAction | PageAction;

export const init = () : ResultT<any, EffectT<any>> => {
    return Result({}, Effect.none);
};

export const update = (state : any, action : GuessAction) : ResultT<any, EffectT<any>> => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        //Evaluate if correct or not
        //then return a new state
        return Result(state, Effect.none);
    }
};

export const view = (state : any, next : any, navigate : any) : React.ReactElement<any> => {
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
