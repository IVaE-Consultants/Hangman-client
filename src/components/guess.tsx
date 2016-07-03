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
}
const State = Record<StateAttrs>({
    word: undefined,
    guessed: guessed,
    unknown: undefined,
    tries: 8,
    revealed: [...Array(word.length+1).join('?')],
    firstKnown: undefined,
    lastKnown: undefined,
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
    const nextState = State({
        word,
        unknown: word.length,
        revealed: [...Array(word.length+1).join('?')],
    });
    return Result(nextState, Effect.none);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        // letter that was guessed
        let letter = data.toUpperCase();
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
        console.log(positions);
        if (positions.length>0 && firstKnown == undefined){
            firstKnown = positions[0];
            lastKnown = positions[0];
        }
        let max = Math.max.apply(null, positions);
        let min = Math.min.apply(null, positions);
        // ensure no overflow
        max = Math.min(max+1, word.length);
        min = Math.max(min-1, 0);
        lastKnown = (max>lastKnown) ? max  : lastKnown;
        firstKnown = (min<firstKnown) ? min : firstKnown;
       
        console.log(firstKnown, lastKnown);
        // update revealed
        revealed = revealed.map((curr : string, index : number) => {
                if (positions.includes(index)){
                    return chars[index];
                }
                // reveal the number of letters between the known
                if (index>firstKnown && index<lastKnown && curr == '?'){
                    return '*';
                }
                // reveal next to the first or last known to hint that word is longer
                console.log("cheking!", (positions.includes(index+1) || positions.includes(index-1)) && curr == '?');
                if ((positions.includes(index+1) || positions.includes(index-1)) && curr == '?'){
                    return '*';
                }
                return curr;
        });
        unknown -= positions.length;
        console.log("THE REVEALED,", revealed);

        // update guessed
        let newGuessed = state.guessed.set(letter, true);

        // update misses
        if (positions.length == 0){
            tries -= 1;
        }
        //
        // return a new state
        const newState = state.merge({guessed:newGuessed, revealed, tries, unknown, firstKnown, lastKnown});
        return Result(newState, Effect.none);
    }
};

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    let board = renderTiles(state, next);
    let {revealed, tries, word, unknown, firstKnown, lastKnown} = state;
    let visible : any;
    // have to check undefined cause firstknown can be 0
    if(firstKnown!=undefined){
        visible = revealed.slice(firstKnown, lastKnown+1);
    }
    console.log("VISIBLE:", visible);



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
        <View>
            <TouchableHighlight onPress={()=> navigate(Page.back())}>
            <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#000000',
            }}>
            </View>
            </TouchableHighlight>
            {info}
            <View style={styles.container}>
                    {board}
            </View>
        </View>
   );
};

const renderTiles = (state : state, guess : (action : action)=> void) : any  => {
    let result:any = [];
    for (var row = 0; row < SIZE; row++) {
      for (var col = 0; col < SIZE; col++) {
        let key = row * SIZE + col;
        let letter = String.fromCharCode(65 + key);
        let position = {
          left: col * CELL_SIZE + CELL_PADDING,
          top: row * CELL_SIZE + CELL_PADDING
        };
        const {guessed} = state;
        let bg = {backgroundColor: '#BEE1D2'};
        if (guessed.get(letter)){
            bg = {backgroundColor: '#FF0000'};
        }
        result.push(
        <TouchableHighlight onPress={()=> {guess(Action(Actions.GuessLetter, letter))}}>
          <View key={key} style={[styles.tile, position, bg]}>
            <Text style={styles.letter}>{letter}</Text>
          </View>
        </TouchableHighlight>
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
