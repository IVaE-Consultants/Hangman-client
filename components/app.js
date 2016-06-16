import React from 'react';
import {
    Effect,
    Action,
    Result, 
} from 'effectjs';

import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';


export const init = () => {
    return Result({x:1}, Effect.none);
};

export const update = (state, action) => {
    const {type} = action;
    if (type === 'increment') {
        return Result({ x: state.x + 1 }, Effect.none);
    }
};

export const view = (state, next) => {
    return (
        <TouchableOpacity onPress={() => next(Action('increment'))}>
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 150,
            height: 150,
            backgroundColor: 'green',
        }}  > 
            <Text>{state.x}</Text>
        </View>
        </TouchableOpacity>
   );
};


