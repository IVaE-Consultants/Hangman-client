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
};

export const view = (state : any, next : (action : any) => void) => {
    return (
    <TouchableHighlight onPress={()=> {console.log("Ho yeah");next(Action('page', {page: '/guess'}))}}>
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
