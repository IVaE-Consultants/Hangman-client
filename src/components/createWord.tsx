import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import * as Keyboard from './keyboard';
import * as Game from './game';
import * as Word from './word';

const uuid = require('uuid');


enum Actions {
    keyAction,
    Done,
}


export type replies = gameChangedAction;
type gameChangedAction = Action<Replies.GameChanged, Game.state>;
export const enum Replies {
    GameChanged,
    Never,//Tagged unions require enums with multiple options
}
interface StateAttrs {
    reply? : Reply<any>;
    components?: Map<string, Component<any,any,any>>;
    states?: Map<string, any>;
    mappers?: Map<string, mapper>;
    game?: Game.state;
    myWord?: string;
    keyboardKeys?: List<Keyboard.Key>;
}
const State = Record<StateAttrs>({
    keyboardKeys: undefined,
    myWord: undefined,
    game: undefined,
    components: undefined,
    states: undefined,
    mappers: undefined,
    reply: undefined,
});

export type state = Record.IRecord<StateAttrs>;
type keyAction = Action<Actions.keyAction, Keyboard.action>
type doneAction = Action<Actions.Done, undefined>
export type action = keyAction | doneAction;
export type result = Result<state, action>;


// ASSUMPTION : Both arrays are same length
const zip = <X,Y>(xs : X[], ys : Y[]) : [X, Y][] => {
    const result = xs.map((x : X, i : number) => {
        const y : Y = ys[i];
        const pair : [X, Y] = [x, y];
        return pair;
    });
    return result;
}
type mapper = (id : string) => (action : any) => action;
type config<S,A> = {
    component : Component<S, A, any>;
    options? : options;
    reply? : Reply<action>;
    mapper? : mapper;
}
type options = any;



export const init = (game : Game.state, reply? : Reply<any>) : result => {
    const alphabet = [...'FGHASDTUUZX'];
    const keyboardKeys = Keyboard.createKeys((text : string, id : number) => {
        return Keyboard.Key({text, id});
    })(alphabet);

    const state = State({
        myWord: '',
        game,
        reply,
        keyboardKeys,
    });
    return Result(state);
};

export const update = (state : state, action : action) : result => {
    switch (action.type) {
        case Actions.keyAction:
            const innerAction = action.data
            switch (innerAction.type) {
                case Keyboard.Actions.Press:
                {
                    const {myWord: oldWord, keyboardKeys: oldKeys} = state;
                    const {data: key} = innerAction;
                    const myWord = oldWord + key.text;
                    const keyboardKeys = Keyboard.disableKey(key, oldKeys!);
                    const nextState = state.merge({ myWord, keyboardKeys });
                    return Result(nextState);
                }
                case Keyboard.Actions.Disable:
                    throw new Error("Not implemented Actions.Disable")
                case Keyboard.Actions.Move:
                    const {data: letter} = innerAction;
                    const {keyboardKeys} = state;
                    const letterIndex = keyboardKeys!.findKey((item: Keyboard.Key) => item.id === letter.id);
                    const newLetters = keyboardKeys!.remove(letterIndex).push(letter);
                    const nextState = state.merge({ keyboardKeys: newLetters });
                    return Result(nextState);
            }
        case Actions.Done:
            const {game, myWord, reply} = state;
            if (myWord) {
                const {state: gameState2, effect: gameEffect2} = Game.update(game!, Action<Game.Actions.GotWord, string>(Game.Actions.GotWord, myWord));
                const {state: gameState, effect: gameEffect} = Game.update(gameState2, Action<Game.Actions.NextGameStep>(Game.Actions.NextGameStep));

                const nextState = state.merge({ game: gameState });
                const replyEffect = reply!(Action(Replies.GameChanged, gameState));
                return Result(nextState, replyEffect);
            } else {
                return Result(state);
            }

    }
    throw new Error(`Invalid action type in component: createWord`);
};

import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
    },
    listView: {
        marginTop: 50,
        flex: 1,
    },
    backButton: {
        marginTop: 50,
        backgroundColor: '#00FF00',
    },
    row: {
        height: 80,
        borderTopWidth: 1,
        borderColor: 'rgb(239,239,239)',
    },
    word: {
        flex: 1,
    },
    keyboard: {
        alignSelf: 'flex-end',
    },
});

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {keyboardKeys} = state;
    const keyboard = Keyboard.view(keyboardKeys!, (act : Keyboard.action) : void => next!(Action<Actions.keyAction, Keyboard.action>(Actions.keyAction, act)));
    const {myWord} = state;
    return (
        <View style={styles.container as any}>
            <TouchableHighlight style={styles.backButton} onPress={() => {next!(Action<Actions.Done>(Actions.Done)); navigate!(Page.pop()) }} >
                <View>
                    <Text> Done! </Text>
                </View>
            </TouchableHighlight>
            <View style={styles.word}>
                <Text>{myWord}</Text>
            </View>
            <View style={styles.keyboard as any}>{keyboard}</View>
        </View>
   );
};


export const component = {init, update, view} as Component<state, action, any>;
