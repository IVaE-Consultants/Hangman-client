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
const defaultLanguage = 'swe';
const defaultNumOfRows = 4;

const getAlphabet = (language: string): string[] => {
    if (language == 'swe') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'];
    } else if (language == 'eng') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    }
    throw new Error('Not an available language: ' + language);
}

type keymap = Map<string, any>;
type key = Record.IRecord<KeyAttrs>;

const defaultKeyMap = (): keymap => {
    const alphabet = getAlphabet(defaultLanguage);
    const chars = alphabet;
    const keyMap = chars.reduce((acc: keymap, letter: string) => {
        const key = Record<KeyAttrs>({ letter, active: true, color: defaultActiveColor })();
        return acc.set(letter, key);
    }, Map<string, any>());
    return keyMap;
}

interface KeyAttrs {
    active?: boolean;
    letter?: string;
    color?: string;
}


const Key = (letter: string, active: boolean = true) => {
    let color = active ? defaultActiveColor : defaultInactiveColor;
    return Record<KeyAttrs>({ letter, active, color });
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
export type action = Action<Actions, string>;
export type result = Result<state, Effect<action>>;

const {width, height} = require('Dimensions').get('window');
const KEYBOARDROWS = 5; // Number of rows to divide letters in
const CELL_SIZE = Math.floor(width * .13); // 20% of the screen width
const CELL_PADDING = Math.floor(CELL_SIZE * .05); // 5% of the cell size
const BORDER_RADIUS = CELL_PADDING * 2;
const TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
const LETTER_SIZE = Math.floor(TILE_SIZE * .75);

const getDefaultState = () => {
    const keyMap = defaultKeyMap();
    // TODO: default row states. Get what keys should be in what row and col
    // generate tsx code for each row and store in rowStates
    return State({ keyMap });
}


export const init = () => {
    const initState = getDefaultState();
    return Result(initState);
}

export const update = (state: state, action: action) => {
    const {type, data} = action;
    const {keyMap} = state;
    if (type === Actions.Disable) {
        console.log('Disable key should happen here');
        const key = keyMap.get(data);
        const newKey = key.merge({ active: false, color: defaultInactiveColor });
        const newKeyMap = keyMap.set(data, newKey);
        const newState = state.merge({ keyMap: newKeyMap });
        return Result(newState);
    }
    throw new Error('Ivalid action type keyboard');
}

export const view = (state: state, next?: (action: action) => void) => {
    let board = renderTiles(state, next);
    return (
        <View style={styles.container}>
            {board}
        </View>
    );
}

const getKeyPosition = (index: number, numOfKeys: number) => {
    const keysPerRow = Math.ceil(numOfKeys / KEYBOARDROWS);
    console.log("Number of keys per row is "+keysPerRow);
    
    let position = {
        left: (index % keysPerRow) * CELL_SIZE + CELL_PADDING,
        top: Math.trunc(index / keysPerRow) * CELL_SIZE + CELL_PADDING,
    };
    return position;

}

const renderTiles = (state: state, next: (action: action) => void) => {
    const {language, keyMap} = state;
    const chars = getAlphabet(language);
    return chars.map<any>((char: string, index: number) => {
        return (
            <TouchableHighlight key={char.charCodeAt(0) } onPress={() => next(Action(Actions.Disable, char)) }>
                <View  style={[styles.tile, getKeyPosition(index, chars.length), { backgroundColor: keyMap.get(char).color }]}>
                    <Text style={styles.letter}>{char}</Text>
                </View>
            </TouchableHighlight>

        );
    });
}

var styles = StyleSheet.create({
    container: {
        width: width * 0.9,
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
