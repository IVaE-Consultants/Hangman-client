import * as React from 'react';
const {Action, Effect, Result} = require('effectjs');
import {Page, goToPage} from './PageActions';
import {ResultT, EffectT} from './EffectTypes';

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';


export const init = () => {
    return Result({}, Effect.none);
};

export const update = (state : any, action : any) : ResultT<any,EffectT<any>> => {
    return Result(state);
};

export const view = (state : any, next : any, navigate : (action : any) => void) => {
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
