import * as React from 'react';
import {Record, Map, List} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';
import {perform} from '../utils';
import * as Word from './word';

import {View, Text} from 'react-native';


const enum Actions{
    MyWord,
    TheirWord,
}


interface StateAttrs {
    myWord? : Word.state;
    theirWord? : Word.state;
    name? : string;
}

const State = Record<StateAttrs>({
    myWord: undefined,
    theirWord: undefined,
    name: undefined,
});

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, Word.action>;
export type result = Result<state, action>;
export const theirWord = (state : state) : string => {
    return state.theirWord.word;
}

const myAction = (action : Word.action) : action => Action(Actions.MyWord, action);
const theirAction = (action : Word.action) : action => Action(Actions.TheirWord, action);

export const init = (index : number) : result => {
    const {state: myWord, effect: myEffect} = Word.init();
    const {state: theirWord, effect: theirEffect} = Word.init();
    const state = State({myWord, theirWord, name: `Game ${index + 1}`});
    const effect = Effect.all([
        myEffect.map((action) => myAction(action)),
        theirEffect.map((action) => theirAction(action)),
    ]);
    return Result(state, effect);
};

export const update = (state : state, action : action) : result  => {
    const {type, data} = action;
    if(type === Actions.MyWord) {
        const {state: myWord, effect: myEffect} = Word.update(state.myWord, data);
        const nextState = state.merge({myWord});
        const effect = myEffect.map((action: Word.action) : action => myAction(action));
        return Result(nextState, effect);
    } else if(type === Actions.TheirWord) {
        const {state: theirWord, effect: theirEffect} = Word.update(state.theirWord, data);
        const nextState = state.merge({theirWord});
        const effect = theirEffect.map((action: Word.action) : action => theirAction(action));
        return Result(nextState, effect);
    }
};

export const view = (state : state, next? : any) => {
    const {myWord, theirWord, name} = state;
    return (<View style={{backgroundColor: 'green'}}>
        <Text>{name}</Text>
        <Text>{myWord.word}</Text>
    </View>);
};

