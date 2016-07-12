import * as React from 'react';
import {Action, Effect, Result, Component} from 'effectjs';
import * as Page from './Page';
import {Record, Map} from 'immutable';
import * as Game from './game';
import * as Keyboard from './keyboard';

import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

const enum Actions {
    GuessLetter,
}

type Guessed = {[key:string]: boolean};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const chars = [...alphabet];
const guessedLetters = chars.reduce( (acc: Guessed, letter: string) : Guessed  => {
    acc[letter] = false;
    return acc;
}, {} as Guessed);

const guessed : Map<string, boolean> = Map(guessedLetters);
const word = 'HELLO';

interface StateAttrs {
    word?: string;
    guessed?: Map<string,boolean>;
    unknown?: number;
    tries?: number;
    revealed?: string[];
    firstKnown?: number;
    lastKnown?: number;
    keyboardState?: Keyboard.state;
}
const State = Record<StateAttrs>({
    word: undefined,
    guessed: guessed,
    unknown: undefined,
    tries: 8,
    revealed: [...Array(word.length+1).join('?')],
    firstKnown: undefined,
    lastKnown: undefined,
    keyboardState: undefined,
});

type state = Record.IRecord<StateAttrs>;
type action = Action<Actions,Action<Keyboard.Actions, Letter>>;
type result = Result<state,Effect<action>>;
type Letter = string;

// type as Game component
export const init = (word : string) : result => {
    const {state: keyboardState, effect} = Keyboard.init();
    // TODO: map effects
    const nextState = State({
        word,
        unknown: word.length,
        revealed: [...Array(word.length+1).join('?')],
        keyboardState,
    });
    return Result(nextState, Effect.none);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        // data is Action(Keyboard.Actions.Disable, char)
        const {data: char} = data;
        // update keyboard
        const {state: nextKeyboardState, effect: keyboardEffects} = Keyboard.update(state.keyboardState, data);


        // letter that was guessed
        let letter = char.toUpperCase();
        let {word, tries, revealed, unknown, firstKnown, lastKnown} = state;
        let chars = [...word];
        if (state.guessed.get(letter)){
            console.log('ALREADY guessed that letter');
            return Result(state);
        }
        //Evaluate if correct or not
        const positions = chars.reduce((acc:number[], char: string, i:number) => {
            if (char === letter) {
                acc.push(i);
            }
            return acc;
        }, []);
        if (positions.length>0 && firstKnown == undefined){
            firstKnown = positions[0];
            lastKnown = positions[0];
        }
        let max = Math.max.apply(null, positions);
        let min = Math.min.apply(null, positions);
        // ensure no overflow
        max = Math.min(max + 1, word.length);
        min = Math.max(min - 1, 0);
        lastKnown = (max > lastKnown) ? max : lastKnown;
        firstKnown = (min < firstKnown) ? min : firstKnown;
        // update revealed
        revealed = revealed.map((curr: string, index: number) => {
            if (positions.includes(index)) {
                return chars[index];
            }
            // reveal the number of letters between the known
            if (index > firstKnown && index < lastKnown && curr == '?') {
                return '*';
            }
            // reveal next to the first or last known to hint that word is longer
            console.log("cheking!", (positions.includes(index + 1) || positions.includes(index - 1)) && curr == '?');
            if ((positions.includes(index + 1) || positions.includes(index - 1)) && curr == '?') {
                return '*';
            }
            return curr;
        });
        unknown -= positions.length;

        // update guessed
        let newGuessed = state.guessed.set(letter, true);

        // update misses
        if (positions.length == 0){
            tries -= 1;
        }
        //
        // return a new state
        const newState = state.merge({keyboardState:nextKeyboardState, guessed:newGuessed, revealed, tries, unknown, firstKnown, lastKnown});
        return Result(newState, Effect.none);
    }
};

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {keyboardState} = state;
    const testboard = Keyboard.view(keyboardState, (act : Keyboard.action) : void => next(Action(Actions.GuessLetter, act)));
    let {revealed, tries, word, unknown, firstKnown, lastKnown} = state;
    let visible : any;
    // have to check undefined cause firstknown can be 0
    if(firstKnown!=undefined){
        visible = revealed.slice(firstKnown, lastKnown+1);
    }


    let info = <View>
                <Text> Tries left: {tries} </Text>
                <Text> {visible} </Text>
           </View>
    if (tries == 0){
        info = <View>
                <Text> You Lost! Correct word was: </Text>
               <Text> {word} </Text>
           </View>
    }
    if (unknown == 0){
        info = <View>
                <Text> YOU WON! Word was: </Text>
               <Text> {word} </Text>
           </View>
    }

    return (
        <View style={styles.container as any}>
            <TouchableHighlight onPress={()=> navigate(Page.back())}>
            <View style={styles.backContainer}>
                <Text style={styles.backText as any}>{'<'}</Text>
            </View>
            </TouchableHighlight>
            {info}
            <View>
                    {testboard}
            </View>
        </View>
   );
};


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    backContainer: {
        width: 50,
        height: 50,
    },
    backText: {
        fontSize: 32,
        fontWeight: '300',
        textAlign: 'center',
    },
});

