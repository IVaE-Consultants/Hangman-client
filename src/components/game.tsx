import * as React from 'react';
import {Record, Map, List} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';
import {perform, Language, getAlphabet, range} from '../utils';
import * as Word from './word';

import {View, Text, StyleSheet} from 'react-native';


const defaultNumOfRounds = 3;

export const enum Actions{
    MyWord,
    TheirWord,
    NextGameStep,
}

export const enum GameSteps{
    letterSelector,
    createWord,
    guessWord,
    complete,
}

type Guessed = Map<string, boolean>;

interface RoundAttrs {
    myWord? : Word.state;
    theirWord? : Word.state;
    triesLeft?: number;
    guessedLetters?: Map <string, boolean>;
    won?: boolean;
}

const RoundState = Record<RoundAttrs>({
    myWord: undefined,
    theirWord: undefined,
    triesLeft: 8,
    guessedLetters: undefined,
    won: undefined,
});

type roundState = RoundAttrs & Record.TypedMap<RoundAttrs>;

interface StateAttrs {
    id? : number;
    name? : string;
    step?: GameSteps;
    round?: number;
    language?: Language;
    roundStates?: List< roundState >;
}

const State = Record<StateAttrs>({
    name: undefined,
    step: GameSteps.letterSelector,
    round: 0,
    id: undefined,
    language: undefined,
    roundStates: undefined,
});

const initRoundStates = (numOfRounds : number, language : Language) : {roundStates: List< RoundAttrs>, roundEffects : Effect<action>} => {
    const {state: theirWord, effect: theirEffect} = Word.init(true);
    const {state: myWord, effect: myEffect} = Word.init(false);
    const roundEffects = Effect.all([
        theirEffect.map((action) => theirAction(action)),
        myEffect.map((action) => myAction(action)),
    ]);    
    const roundStates =  List(range(0, numOfRounds).map( (roundIndex) =>
        RoundState({
            guessedLetters: initGuessedTable(language),
            theirWord,
            myWord,
        })
    ));
    return {roundStates, roundEffects};
}

const initGuessedTable = (language : Language) => {
    const chars = getAlphabet(language);
    return chars.reduce( (acc: Guessed, letter: string) : Guessed  => {
        return acc.set(letter, false);
    }, Map() as Guessed);
}

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, Word.action> | Action<Actions, string>;
export type result = Result<state, action>;
export const theirWord = (state : state) : string => {
    return state.roundStates.get(state.round).theirWord.word;
}

const myAction = (action : Word.action) : action => Action(Actions.MyWord, action);
const theirAction = (action : Word.action) : action => Action(Actions.TheirWord, action);

type options = {
    id : string;
    language : Language;
}


export const init = ({id, language} : options) : result => {
    const {roundStates, roundEffects} = initRoundStates(defaultNumOfRounds, language);
    const state = State({
        name: `Game round  1`,
        id: id,
        language,
        roundStates,
    });
    
    return Result(state, roundEffects);
};

export const update = (state : state, action : action) : result  => {
    const {type, data} = action;
    if(type === Actions.MyWord) {
        const word = data as string;
        const roundState = state.roundStates.get(state.round);
        const {state: myWord, effect: myEffect} = Word.update(roundState.myWord, Action(Word.Actions.Word, word.toUpperCase()));
        const nextState = state.mergeIn(['roundStates', state.round],{myWord});
        const effect = myEffect.map((action: Word.action) : action => myAction(action));
        return Result(nextState, effect);
    } else if(type === Actions.TheirWord) {
        const wordAction = data as Action<Word.Actions, string>;
        const roundState = state.roundStates.get(state.round);
        const {state: theirWord, effect: theirEffect} = Word.update(roundState.theirWord, wordAction);
        const nextState = state.mergeIn(['roundStates', state.round],{theirWord});
        const effect = theirEffect.map((action: Word.action) : action => theirAction(action));
        return Result(nextState, effect);
    } else if (type === Actions.NextGameStep) {
        const step = ((step: GameSteps): GameSteps => {
            switch (step) {
                case GameSteps.letterSelector: return GameSteps.createWord;
                case GameSteps.createWord: return GameSteps.guessWord;
                case GameSteps.guessWord: return GameSteps.complete;
                //case GameSteps.complete: return GameSteps.createWord;
                //default: 
                //    throw new Error("Invalid step in game")
            }
        })(state.step);
        const newState = state.merge({step})
        return Result(newState);
    }
};

export const view = (state : state, next? : any) => {
    const roundState = state.roundStates.get(state.round);
    const {name} = state;
    const {myWord, theirWord} = roundState;
    return (
        <View style={styles.container as any}>
            <Text style={styles.textStyle}>{name}</Text>
            <Text style={styles.textStyle}>{ myWord ? myWord.word : ""}</Text>
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
