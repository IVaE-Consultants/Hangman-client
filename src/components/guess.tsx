import * as React from 'react';
const {Action, Effect, Result} = require('effectjs');

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';


export const init = () => {
    return Result({}, Effect.none);
};

export const update = (state : any, action : any) => {
    const {type, data} = action;
    if (type === 'guess letter') {
        //Evaluate if correct or not
        //then return a new state
        return Result(state, Effect.none);
    }
};

export const view = (state : any, next : (action : any) => any) => {
    return (
        <TouchableHighlight onPress={()=> {next(Action('page', {page: '/main'}))}}>
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
