import * as React from 'react';
import {Action, Effect, Result, Component} from 'effectjs';
import {Record, List} from 'immutable';

import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

export const enum Actions {
    Press,
    Disable,
}

const defaultActiveColor = '#BEE1D2';
const defaultInactiveColor = '#FF0000';
const defaultLanguage = 'swe';

export const getAlphabet = (language : string = defaultLanguage) : string[] => {
    if (language == 'swe') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'];
    } else if (language == 'eng') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    }
    throw new Error('Not an available language: ' + language);
}

export const disableKey = (toDisable : Key, keys : List<Key>) : List<Key> => {
    const index = keys.findIndex((key) => key.id === toDisable.id);
    const disabled = toDisable.merge({enabled: false});
    return keys.set(index, disabled);
};

export type Key = Record.IRecord<KeyAttrs>;
export const Key = (attributes : KeyAttrs) => {
    const defaults = {
        text: '…',
        enabled: true,
        id: 0,
    };
    return Record<KeyAttrs>(defaults)(attributes);
};

interface KeyAttrs {
    id? : number;
    text? : string;
    enabled? : boolean;
}

export const createKeys = (f : (text : string, index? : number) => Key) =>
    (alphabet : string[]) : List<Key> =>
        List(alphabet.map(f));

export type disableAction = Action<Actions, string>;
export type pressAction = Action<Actions, Key>;
export type setBackgroundColorAction = Action<Actions, { key : string, color : string } >;
export type action = pressAction | disableAction | setBackgroundColorAction;

const {width, height} = require('Dimensions').get('window');
const KEYBOARDROWS = 5; // Number of rows to divide letters in
const CELL_SIZE = Math.floor(width * .13); // 20% of the screen width
const CELL_PADDING = Math.floor(CELL_SIZE * .05); // 5% of the cell size
const BORDER_RADIUS = CELL_PADDING * 2;
const TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
const TILE_MARGIN = 3;
const LETTER_SIZE = Math.floor(TILE_SIZE * .75);


const styles = StyleSheet.create({
    container: {
        width: width,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'blue',
    },
    tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        margin: TILE_MARGIN,
        borderRadius: BORDER_RADIUS,
        backgroundColor: defaultActiveColor,
    },
    letter: {
        color: '#333',
        fontSize: LETTER_SIZE,
        fontFamily: 'Arial',
        backgroundColor: 'transparent',
    },
});

const keyPress = (key : Key) => {
    return Action(Actions.Press, key);
}

export const isKeyPress = (action : action) => {
    return action.type === Actions.Press;
}

const press = (next : (action : action) => void) => (key : Key) => () => {
    if(key.enabled) {
        next(keyPress(key));
    }
}

const renderTiles = (keys: List<Key>, next: (action: action) => void) => {
    return keys.map<any>((key: Key, index : number) => {
        const {text, enabled} = key;
        const color = enabled ? defaultActiveColor : defaultInactiveColor;
        return (
            <TouchableHighlight key={index} onPress={press(next)(key)}>
            <View style={[styles.tile as any, {backgroundColor: color}]}>
                <Text style={styles.letter as any}>{text}</Text>
            </View>
            </TouchableHighlight>
        )
    });
}

export const view = (keys: List<Key>, next?: (action: action) => void) => {
    let board = renderTiles(keys, next);
    return (
        <View style={styles.container as any}>
            {board}
        </View>
    );
}

