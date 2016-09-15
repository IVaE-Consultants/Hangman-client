import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import * as Game from './game';
import * as Keyboard from './keyboard';
import * as utils from '../utils';


enum Actions {
    done,
    keyAction,
}

interface StateAttrs {
    reply? : Reply<any>;
    game?: Game.state;
    keyboardKeys?:List<Keyboard.Key>;
}
const State = Record<StateAttrs>({
    reply: undefined,
    game: undefined,
    keyboardKeys: undefined,
});

export const enum Replies {
    GameChanged,
    Never,//Tagged unions require enums with multiple options
}

export type replies = gameChangedAction;
type gameChangedAction = Action<Replies.GameChanged, Game.state>;

export type state = Record.IRecord<StateAttrs>;

type keyAction = Action<Actions.keyAction, Keyboard.action>
type doneAction = Action<Actions.done, undefined>
export type action = keyAction | doneAction;
export type result = Result<state, action>;

const vowels = 'AOUEIY';
const consonants = 'BCDFGHJKLMNPQRSTVWX';

const getRandomAlphabet = (n : number) => {
    const numOfVowels = Math.floor(0.4*n);
    
    var alphabet = utils.range(0,numOfVowels).map(x=>vowels[Math.floor(Math.random()*vowels.length)]);
    alphabet = alphabet.concat(utils.range(0,n-numOfVowels).map(x=>consonants[Math.floor(Math.random()*consonants.length)]));
    return alphabet;
}

export const init = (game : Game.state, reply? : Reply<any>) : result => {

    const alphabet = getRandomAlphabet(20); 
    const keyboardKeys = Keyboard.createKeys((text : string, id : number) => {
        return Keyboard.Key({text, id});
    })(alphabet);   

    const state = State({
        reply,
        game,
        keyboardKeys,
    });
    return Result(state, Effect.none);
};

export const update = (state: state, action: action): result => {
    switch (action.type) {
        case Actions.keyAction:
            const innerAction = action.data
            switch (innerAction.type) {
                case Keyboard.Actions.Press:
                    {
                        return Result(state);
                    }
                case Keyboard.Actions.Disable:
                    throw new Error("Not implemented Actions.Disable")
                case Keyboard.Actions.Move:
                    const {data: letter} = innerAction;
                    const {keyboardKeys} = state;
                    const newKeyboardKeys = keyboardKeys!.map(x => {
                        if (x!.zIndex <= letter.zIndex) {
                            return x!
                        } else {
                            return x!.set("zIndex", x!.zIndex - 1);
                        }
                    }).toList();
                    const letterIndex = newKeyboardKeys.findKey((item: Keyboard.Key) => item.id === letter.id);
                    const newLetters = newKeyboardKeys.set(letterIndex, letter.set("zIndex", newKeyboardKeys!.count()));
                    const nextState = state.merge({ keyboardKeys: newLetters });

                    return Result(nextState);
            }
        case Actions.done:
            const {state: gameState, effect: gameEffect} = Game.update(state.game!, Action<Game.Actions.NextGameStep>(Game.Actions.NextGameStep));
            const replyEffect = state.reply!(Action(Replies.GameChanged, gameState));
            //TODO: handle effects
            const newState = state.merge({ game: gameState });
            return Result(newState, replyEffect);

    }
    throw new Error(`Invalid action type in component: letterSelector `);
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
    },
    listView: {
        marginTop: 50,
        flex: 1,
    },
    backButton: {
        marginTop: 50,
        backgroundColor: '#00FF00',
    },    row: {
        height: 80,
        borderTopWidth: 1,
        borderColor: 'rgb(239,239,239)',
    },
    tile: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#BEE1D2",
        borderColor: "#222",
        borderWidth:2,
    },
    letter: {
        color: '#333',
        fontSize: 28,
        fontFamily: 'Arial',
        backgroundColor: 'transparent',
    },
});


export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {keyboardKeys} = state;
    const keyboard = Keyboard.view(keyboardKeys!, (act : Keyboard.action) : void => next!(Action<Actions.keyAction, Keyboard.action>(Actions.keyAction, act)));
    return (
        <View>
            <View style={styles.container}>
                <TouchableHighlight style={styles.backButton} onPress={() => { next!(Action<Actions.done>(Actions.done)); navigate!(Page.pop()) }} > 
                    <View>
                        <Text> Done! </Text>
                    </View>
                </TouchableHighlight>
            </View>
            {keyboard}
        </View>
   )
};

export const component = {init, update, view} as Component<state, action, any>;