import * as React from 'react';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction, Actions as PageActions} from './PageActions';
import {Record, Map} from 'immutable';

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

type State = Record.IRecord<StateAttrs>;


type Letter = string;
type GuessAction = Action<Actions,Letter>;
type GuessResult = Result<State,Effect<GuessAction>>;

var {width, height} = require('Dimensions').get('window');
var SIZE = 5; // four-by-four grid
var CELL_SIZE = Math.floor(width * .15); // 20% of the screen width
var CELL_PADDING = Math.floor(CELL_SIZE * .05); // 5% of the cell size
var BORDER_RADIUS = CELL_PADDING * 2;
var TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
var LETTER_SIZE = Math.floor(TILE_SIZE * .75);

export const init = () : GuessResult => {
    return Result(State(), Effect.none);
};

export const update = (state : State, action : GuessAction) : GuessResult => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        // letter that was guessed
        let letter = data;
        let {word} = state;
        let chars = [...word];
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

export const view = (state : State, next : (action : GuessAction) => void, navigate : (action : PageAction) => void) => {
    let board = renderTiles(next);
    return (
        <View>
            <TouchableHighlight onPress={()=> {navigate(goToPage(Page.Main))}}>
            <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#000000',
            }}>
            </View>
            </TouchableHighlight>
            <View style={styles.container}>
                    {board}
            </View>
        </View>
   );
};

const renderTiles = (guess :(action :GuessAction)=> void) : any  => {
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
