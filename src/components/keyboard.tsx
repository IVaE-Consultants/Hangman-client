import * as React from 'react';
import {Action, Effect, Result, Component} from 'effectjs';
import {Record, Map} from 'immutable';

import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

export const enum Actions {
    Disable,
}

const defaultActiveColor = '#BEE1D2';
const defaultInactiveColor = '#FF0000';
const defaultLanguage = 'eng';
const defaultNumOfRows = 4;

const getAlphabet = (language : string) : string[]=> {
    if (language == 'swe'){
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'];
    } else if (language == 'eng'){
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    }
    throw new Error('Not an available language: ' + language);
}

type keymap = Map<string, any>;
type key = Record.IRecord<KeyAttrs>;

const defaultKeyMap = () : keymap => {
    const alphabet = getAlphabet(defaultLanguage);
    const chars = alphabet;
    const keyMap = chars.reduce( (acc : keymap, letter : string) => {
        //const key = Record<KeyAttrs>({letter,active: true, color: defaultActiveColor})();
        const key = {letter, active: true, color: defaultActiveColor, position: undefined as [number, number]};
        return acc.set(letter, key);
    }, Map<string, any>());
    return keyMap;
}

interface KeyAttrs {
    active?: boolean;
    letter?: string;
    color?: string;
    position?: [number, number];
}


const Key = (letter : string, active : boolean = true)  => {
    let color = active ? defaultActiveColor : defaultInactiveColor;
    return Record<KeyAttrs>({letter,active, color});
}

interface StateAttrs {
    keyMap?: Map<string, key>;
    activeColor?: string;
    inactiveColor?: string;
    language?: string;
    numOfRows?: number;
    rowStates?: any[];
}
const State = Record<StateAttrs>({
    keyMap: undefined,
    activeColor: defaultActiveColor,
    inactiveColor: defaultInactiveColor,
    language: defaultLanguage,
    numOfRows: defaultNumOfRows,
    rowStates: undefined,
});

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions,string>;
export type result = Result<state,Effect<action>>;

var {width, height} = require('Dimensions').get('window');
var KEYBOARDROWS = 5; // Number of rows to divide letters in
var CELL_SIZE = Math.floor(width * .13); // 20% of the screen width
var CELL_PADDING = Math.floor(CELL_SIZE * .05); // 5% of the cell size
var BORDER_RADIUS = CELL_PADDING * 2;
var TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
var LETTER_SIZE = Math.floor(TILE_SIZE * .75);

const getDefaultState = () => {
    const keyMap = defaultKeyMap();
    // TODO: default row states. Get what keys should be in what row and col
    // generate tsx code for each row and store in rowStates
    return State({keyMap});
}


export const init = () => {
    const initState = getDefaultState();
    return Result(initState);
}

export const update= (state : state, action : action) => {
    const {type, data} = action;
    const {keyMap} = state;
    if (type === Actions.Disable){
        console.log('Disable keeey should happen here');
        const key  = keyMap.get(data);
        key.active = false;
        key.color  = defaultInactiveColor;
        console.log(key);
        const newKeyMap = keyMap.set(data, key);
        console.log(newKeyMap);
        const newState = state.merge({keyMap: newKeyMap});
        return Result(newState);
    }
    throw new Error('Ivalid action type keyboard');
}

export const view = (state : state, next? : (action : action) => void) => {
    let board = renderTiles(state, next);
    return (
            <View style={styles.container}>
                    {board}
            </View>
   );
}

const getKeyPosition = (index : number, numOfKeys : number) : any => {
    const firstRow = 'ABCDEFG';
    const secondRow = 'HIJKLM';
    const thirdRow = 'NOPQRST';
    const fourthRow = 'UVWXYZ';
    const keysPerRow = numOfKeys / KEYBOARDROWS;
    const col = index % KEYBOARDROWS;
    let row = 0;
    while (index>(row+1)*keysPerRow){
        row += 1;
    }
    let position = {
      left: col * CELL_SIZE + CELL_PADDING,
      top: row * CELL_SIZE + CELL_PADDING
    };
    return position;

}

const renderTiles = (state : state, next : (action : action)=> void) : any  => {
    const {language, keyMap} = state;
    const chars = getAlphabet(language);
    return chars.map<any>( ( char : string, index : number ) => {
        return (
            <TouchableHighlight key={char.charCodeAt(0)} onPress={()=> next(Action(Actions.Disable, char))}>
              <View  style={[styles.tile, getKeyPosition(index, chars.length), {backgroundColor: keyMap.get(char).color}]}>
                <Text style={styles.letter}>{char}</Text>
              </View>
            </TouchableHighlight>

        );
    });
}

var styles = StyleSheet.create({
  container: {
    width: width*0.9,
    height: CELL_SIZE * KEYBOARDROWS,
    backgroundColor: 'transparent',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: defaultActiveColor,
  },
  letter: {
    color: '#333',
    fontSize: LETTER_SIZE,
    fontFamily: 'Arial',
    backgroundColor: 'transparent',
  },
});
