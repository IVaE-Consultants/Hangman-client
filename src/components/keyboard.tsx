import * as React from 'react';
import {Action, Effect, Result, Component} from 'effectjs';
import {Record, List} from 'immutable';

import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    Dimensions,
} from 'react-native';

export const enum Actions {
    Press,
    Disable,
    Move,
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
    const index = keys.findIndex((key) => key!.id === toDisable.id);
    const disabled = toDisable.merge({enabled: false});
    return keys.set(index, disabled);
};

export type Key = Record.IRecord<KeyAttrs>;
export const Key = (attributes : KeyAttrs) => {
const defaults = {
        text: '…',
        enabled: true,
        id: 0,
        x:0,
        y:0,
        offsetX:0,
        offsetY:0,
    };
    return Record<KeyAttrs>(defaults)(attributes);
};

interface KeyAttrs {
    id? : number;
    text? : string;
    enabled? : boolean;
    x?:number;
    y?:number;
    offsetX?:number;
    offsetY?:number;
}

export const createKeys = (f : (text : string, index? : number) => Key) =>
    (alphabet : string[]) : List<Key> =>
        List(alphabet.map(f));

export type disableAction = Action<Actions.Disable, string>;
export type pressAction = Action<Actions.Press, Key>;
export type moveAction = Action<Actions.Move, Key>;
export type action = pressAction | disableAction |  moveAction;

const {width, height} = Dimensions.get('window');
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
    return Action<Actions.Press, Key>(Actions.Press, key);
}

export const isKeyPress = (action : action) => {
    return action.type === Actions.Press;
}

const press = (next : (action : pressAction) => void) => (key : Key) => () => {
    if(key.enabled) {
        next(keyPress(key));
    }
}
const setPosition = (letter:Key, next: (action : moveAction)=> void) => (e:any) => {
    const pressX = e.nativeEvent.pageX as number;
    const pressY = e.nativeEvent.pageY as number;
    const {offsetX, offsetY, x, y} = letter;
    const newLetter = letter.merge({x:x+pressX-offsetX, y:y+pressY-offsetY, offsetX:pressX, offsetY:pressY});
    next(Action<Actions.Move, Key>(Actions.Move, newLetter));      
};
const setStartPosition = (letter:Key, next: (action : moveAction)=> void) => (e:any) =>{
    const x = e.nativeEvent.pageX as number;
    const y = e.nativeEvent.pageY as number;
    const newLetter = letter.merge({offsetX: x, offsetY: y});
    next(Action<Actions.Move, Key>(Actions.Move, newLetter));    
};

const getTransform = (letter:Key) =>{
    const transform = [{translateX: letter.x}, {translateY:letter.y}]
    return {transform:transform};
}

const renderTiles = (keys: List<Key>, next: (action: action) => void) => {
    return keys.map<any>((key: Key, index : number) => {
        const {text, enabled} = key;
        const color = enabled ? defaultActiveColor : defaultInactiveColor;
        return (
               <View
                    onResponderMove={setPosition(key, next!)}
                    onResponderGrant={setStartPosition(key, next!)}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    style={[styles.tile, getTransform(key)]}
                    key={key.id}>
                    <Text style={[styles.letter]}>{text}</Text>
                </View>
                )
    });
}

export const view = (keys: List<Key>, next?: (action: action) => void) => {
    let board = renderTiles(keys, next!);
    return (
        <View style={styles.container as any}>
            {board}
        </View>
    );
}

