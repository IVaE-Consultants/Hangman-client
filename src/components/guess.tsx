import * as React from 'react';
import {Action, Effect, Result} from 'effectjs';
import {Page, goToPage, PageAction, Actions as PageActions} from './PageActions';

import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

const enum Actions {
    GuessLetter,
}


const enum Attributes {
    x,
    y,
}

const getKey = (key: Attributes) : string => {
    switch (key){
        case(Attributes.x):
            return 'x';
    }
}

type State = {
    word: string
};
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
    return Result({word: 'HELLO'}, Effect.none);
};

export const update = (state : State, action : GuessAction) : GuessResult => {
    const {type, data} = action;
    if (type === Actions.GuessLetter) {
        // letter that was guessed
        let letter = data;
        let {word} = state;
        let chars = [...word];
        const positions = chars.reduce((acc:number[], char: string, i:number) => {
            if (char === letter) {
                acc.push(i);
            }
            return acc;
        }, []);
        console.log(positions);
        //Evaluate if correct or not
        //then return a new state
        return Result(state, Effect.none);
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
