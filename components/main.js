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
};

export const view = (state, next) => {
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
