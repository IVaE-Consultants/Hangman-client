import * as React from 'react';
import * as guess from './guess'
import * as main from './main'

const {
    Effect,
    Action,
    Result,
} = require('effectjs');

import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

interface Component {
    init : (props : any) => any;
    update : (state : any, action : any) => any;
    view : (state : any, next : (action : any) => any) => any;
};

enum Page {
    Main,
    Guess
}

enum Actions {
    Increment,
    Page,
}

interface Action<K,V> {
    type : K;
    data : V;
}

type AppAction = Action<Actions, any>;

const pages = (page : Page) : Component => {
    if (page === Page.Main) {
        return main;
    } else if(page === Page.Guess) {
        return guess;
    }
}

export const init = () => {
    return Result({x:1,
        page: Page.Main,
    }, Effect.none);
};

export const update = (state : any, action : AppAction) => {
    const {type, data} = action;
    if (type === Actions.Increment) {
        return Result({ x: state.x + 1 }, Effect.none);
    } else if (type === Actions.Page){
        return Result(state);
    }
};

export const view = (state : any, next : (action : AppAction) => void) => {
    const {page} = state;
    const component : Component = pages(page);
    const content = component.view(state[page], Action.wrap(page));

    return (
        <View style={{flex:1}}>
        {content}
        </View>
   );
};


