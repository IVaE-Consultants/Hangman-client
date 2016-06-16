import React from 'react'
import {Action, Effect, Result} from 'effectjs'

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native'


export const init = () => {
    return Result({}, Effects.none);
};

export const update = (state, action) => {
    const {type, data} = action;
    if (type === 'guess letter') {
        //Evaluate if correct or not
        //then return a new state
        return Result(state, Effects.none);
    } 
};

export const view = (state, next) => {
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
