import * as React from 'react';
import {Record, Map, List} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';
import {perform, Language, getAlphabet, range} from '../utils';
import * as Word from './word';

import {View, Text, StyleSheet} from 'react-native';


const defaultNumOfRounds = 3;

const enum Actions{
    MyWord,
    TheirWord,
}

const enum GameSteps{
    createWord,
    guessWord,
    complete,
}

type Guessed = Map<string, boolean>;

interface RoundAttrs {
    triesLeft?: number;
    guessedLetters?: Map <string, boolean>;
    won?: boolean;
}

const RoundState = Record<RoundAttrs>({
    triesLeft: 8,
    guessedLetters: undefined,
    won: undefined,
});

type roundState = RoundAttrs & Record.TypedMap<RoundAttrs>;

interface StateAttrs {
    myWord? : Word.state;
    theirWord? : Word.state;
    id? : number;
    name? : string;
    step?: GameSteps;
    round?: number;
    language?: Language;
    roundStates?: List< roundState >;
}

const State = Record<StateAttrs>({
    myWord: undefined,
    theirWord: undefined,
    name: undefined,
    step: GameSteps.guessWord,
    round: 0,
    id: undefined,
    language: undefined,
    roundStates: undefined,
});

const initRoundStates = (numOfRounds : number, language : Language) : List< RoundAttrs> => {
    return List(range(0, numOfRounds).map( (roundIndex) =>
        RoundState({
            guessedLetters: initGuessedTable(language),
        })
    ));
}

const initGuessedTable = (language : Language) => {
    const chars = getAlphabet(language);
    return chars.reduce( (acc: Guessed, letter: string) : Guessed  => {
        return acc.set(letter, false);
    }, Map() as Guessed);
}

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, Word.action>;
export type result = Result<state, action>;
export const theirWord = (state : state) : string => {
    return state.theirWord.word;
}

const myAction = (action : Word.action) : action => Action(Actions.MyWord, action);
const theirAction = (action : Word.action) : action => Action(Actions.TheirWord, action);

type options = {
    id : string;
    language : Language;
}

export const init = ({id, language} : options) : result => {
    const {state: myWord, effect: myEffect} = Word.init();
    const {state: theirWord, effect: theirEffect} = Word.init();
    const roundStates = initRoundStates(defaultNumOfRounds, language);
    console.log(roundStates);
    const state = State({
        myWord,
        theirWord,
        name: `Game`,
        id: id,
        language,
        roundStates,
    });
    console.log('GAME STATE: ', state);
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
    return (
        <View style={styles.container as any}>
            <Text style={styles.textStyle}>{name}</Text>
            <Text style={styles.textStyle}>{myWord.word}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textStyle: {
        fontSize: 16,
        marginLeft: 20,
    }
})

export const component = {init,update,view} as Component<state, action, any>;
