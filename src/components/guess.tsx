import * as React from 'react';
import {Action, Effect, Result, Component} from 'effectjs';
import * as Page from './Page';
import {Record, Map} from 'immutable';
import * as Game from './game';

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

const guessed = Map(guessedLetters);
const word = 'HELLO';

interface StateAttrs {
    word?: string;
    guessed?: Map<string,boolean>;
    unknown?: number;
}
const State = Record<StateAttrs>({
    word: word,
    guessed: guessed,
    unknown: word.length,
});

type state = Record.IRecord<StateAttrs>;
type action = Action<Actions,Letter>;
type result = Result<state,Effect<action>>;
type Letter = string;

var {width, height} = require('Dimensions').get('window');
var SIZE = 5; // four-by-four grid
var CELL_SIZE = Math.floor(width * .15); // 20% of the screen width
var CELL_PADDING = Math.floor(CELL_SIZE * .05); // 5% of the cell size
var BORDER_RADIUS = CELL_PADDING * 2;
var TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
var LETTER_SIZE = Math.floor(TILE_SIZE * .75);

// type as Game component
export const init = (word : string) : result => {
    return Result(State({word}), Effect.none);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        // letter that was guessed
        let letter = data.toUpperCase();
        let {word} = state;
        let chars = [...word];
        console.log("The word is: ", word);
        console.log("Guessed letter: ", letter);
        if (state.guessed.get(letter)){
            console.log('ALREADY guessed that letter');
        }
        //Evaluate if correct or not
        const positions = chars.reduce((acc:number[], char: string, i:number) => {
            if (char === letter) {
                acc.push(i);
            }
            return acc;
        }, []);
        console.log(positions);
        // update revealed


        // update guessed
        let newGuessed = state.guessed.set(letter, true);


        // update misses
        //
        // return a new state
        const newState = state.merge({guessed:newGuessed});
        return Result(newState, Effect.none);
    }
};

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    let board = renderTiles(next);
    let correct = state.word;
    return (
        <View>
            <TouchableHighlight onPress={()=> navigate(Page.back())}>
            <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#000000',
            }}>
            </View>
            </TouchableHighlight>
            <Text> {correct} </Text>
            <View style={styles.container}>
                    {board}
            </View>
        </View>
   );
};

const renderTiles = (guess :(action : action)=> void) : any  => {
    let result:any = [];
    for (var row = 0; row < SIZE; row++) {
      for (var col = 0; col < SIZE; col++) {
        let key = row * SIZE + col;
        let letter = String.fromCharCode(65 + key);
        let position = {
          left: col * CELL_SIZE + CELL_PADDING,
          top: row * CELL_SIZE + CELL_PADDING
        };
        result.push(
          <View key={key} style={[styles.tile, position]}>
        <TouchableHighlight onPress={()=> {guess(Action(Actions.GuessLetter, letter))}}>
            <Text style={styles.letter}>{letter}</Text>
        </TouchableHighlight>
          </View>
        );
      }
    }
    return result;
}

var styles = StyleSheet.create({
  container: {
    width: CELL_SIZE * SIZE,
    height: CELL_SIZE * SIZE,
    backgroundColor: 'transparent',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BEE1D2',
  },
  letter: {
    color: '#333',
    fontSize: LETTER_SIZE,
    fontFamily: 'Arial',
    backgroundColor: 'transparent',
  },
});
