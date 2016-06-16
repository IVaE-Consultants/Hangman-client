import React from 'react';
import {setFields} from '../objects.js'
import * as guess from './guess.js'
import * as main from './main.js'
//import {delegate} from '../delegates.js'

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


const pages = {
    '/guess': guess,
    '/main': main,
};

export const init = () => {
    return Result({x:1,
        page: '/main',
        }, Effect.none);
};



export const update = (state, action) => {
    const {type, data} = action;
    if (type === 'increment') {
        return Result({ x: state.x + 1 }, Effect.none);
    } else if (type === 'page'){
        console.log("got it");
        const nextState = setFields(state)({
            page: data.page
        });
        return Result(nextState);
    }
};

export const view = (state, next) => {
    const {page} = state;
    const content = pages[page].view(state[page], (action) => (action.type === 'page') ? next(action) : Action.wrap(page)(action));

    return (
        <View style={{flex:1}}>
        {content}
        </View>
   );
};


