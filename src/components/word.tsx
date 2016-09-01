import {perform} from '../utils';
import {Record, Map} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';


export const enum Actions {
    Word,
    WordError,
}

interface StateAttrs {
    word? : string;
    error? : Error;
}
const State = Record<StateAttrs>({
    word: undefined,
    error: undefined,
});

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, any>;
export type result = Result<state, action>;

declare var fetch : any;

const gotWord = (word : string) : action => Action(Actions.Word, word.toUpperCase());
const wordError = (error : Error) : action => Action(Actions.WordError, error);

const getWord = () : Promise<string> => {
    return fetch('http://randomword.setgetgo.com/get.php')
        .then((response : any) => [200].includes(response.status) ? response
             : Promise.reject(new Error('Failed to get word')))
        .then((response : any) => response.text());
}

export const init = (auto: boolean) : result => {
    if(auto){
    const effect = perform(getWord(), (word : string) => gotWord(word), (error : Error) => gotWord('HELLO')); //wordError(error));
    return Result(State(), effect);
    }
    return Result(State());
}

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if(type === Actions.Word) {
        const word = data;
        return Result(state.merge({word}))
    } else if(type === Actions.WordError) {
        const error = data;
        return Result(state.merge({error}));
    }
}

export const word = (state : state) : string => {
    return state.word;
}
