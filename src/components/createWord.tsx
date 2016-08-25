import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import * as Keyboard from './keyboard';
import * as Game from './game';

const uuid = require('uuid');


enum Actions {
    stateChanged,
    delegate,
    selectLetter,
    keyboardAction,
    Done,
}

export const enum Replies {
    GameChanged,
}
interface StateAttrs {
    reply? : Reply<any>;
    components?: Map<string, Component<any,any,any>>;
    states?: Map<string, any>;
    mappers?: Map<string, mapper>;
    game?: Game.state;
    myWord?: string;
    keys?: List<Keyboard.Key>;
}
const State = Record<StateAttrs>({
    keys: undefined,
    myWord: undefined,
    game: undefined,
    components: undefined,
    states: undefined,
    mappers: undefined,
    reply: undefined,
});

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, any>;
export type result = Result<state, action>;

const delegateTo = (id : string) => (action : any) : action =>
    Action(Actions.delegate, {id, action});


// ASSUMPTION : Both arrays are same length
const zip = <X,Y>(xs : X[], ys : Y[]) : [X, Y][] => {
    const result = xs.map((x : X, i : number) => {
        const y : Y = ys[i];
        const pair : [X, Y] = [x, y];
        return pair;
    });
    return result;
}
type mapper = (id : string) => (action : any) => action;
type config<S,A> = {
    component : Component<S, A, any>;
    options? : options;
    reply? : Reply<action>;
    mapper? : mapper;
}
type options = any;
const subComponentsInit = <S, A>(componentList : config<S,A>[]) => {
    const ids : string[] = componentList.map(() => uuid.v4());
    const cs = componentList.map(({component}) => component);
    const components =  Map<string, Component<S,A,any>>(zip(ids, cs));
    const results = zip(ids, componentList).map(
        ([id, {component, options, reply}]) => [id, component.init(options, reply)] as [string, Result<S,A>]
    );
    const states = Map<string, any>(results.map(
        ([id, {state, effect}]) => [id, state] as [string, any])
    );
    const mappers = Map<string, mapper>(zip(ids, componentList)
        .map(([id, {mapper = delegateTo}]) => [id, mapper] as [string, mapper])
    );
    const effects = results.map(([id, {state, effect}]) => {
        const mapper = mappers.get(id);
        return effect.map(mapper(id));
    });
    return {
        states,
        components,
        effects,
        mappers,
    };
}

const handleDelagation = (state : state, {id, action}) => {
    const {components, states, mappers} = state;
    const component = components.get(id);
    const componentState = states.get(id);
    const result = component.update(componentState, action);
    const newStates = states.set(id, result.state);
    const mapper = mappers.get(id);
    const effect : Effect<action> = result.effect.map(mapper(id));
    const pair : [Map<string, any>, Effect<action>] = [newStates, effect];
    return pair;
}

export type replies = Action<Replies, any>;

export const init = (game : Game.state, reply? : Reply<any>) : result => {
    const alphabet = [...'FGHASDTUUZX']
    const keys = Keyboard.createKeys((text : string, id : number) => {
        return Keyboard.Key({text, id});
    })(alphabet);

    const state = State({
        myWord: '',
        game,
        reply,
        keys,
    });
    return Result(state);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.stateChanged){
        // do something and return your new state and effects
        return Result(state, Effect.none);
    } else if (type === Actions.selectLetter){
        const {myWord: oldWord, keys: oldKeys} = state;
        const {data: key} = data as Keyboard.pressAction;
        const myWord = oldWord + key.text;
        const keys = Keyboard.disableKey(key, oldKeys);
        const nextState = state.merge({myWord, keys});
        return Result(nextState);
    } else if (type === Actions.Done){
        const {game, myWord, reply} = state;
        if (myWord) {
            const {state: gameState2, effect: gameEffect2} = Game.update(game, Action(Game.Actions.MyWord, myWord));
            const {state: gameState, effect: gameEffect} = Game.update(gameState2, Action(Game.Actions.NextGameStep, undefined));

            const nextState = state.merge({ game: gameState });
            const replyEffect = reply(Action(Replies.GameChanged, gameState));
            return Result(nextState, replyEffect);
        } else {
            return Result(state);
        }
    }
    throw new Error(`Invalid action type in component: ${type}`);
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
        alignItems: 'stretch',
    },
    listView: {
        marginTop: 50,
        flex: 1,
    },
    backButton: {
        marginTop: 50,
        backgroundColor: '#00FF00',
    },
    row: {
        height: 80,
        borderTopWidth: 1,
        borderColor: 'rgb(239,239,239)',
    },
    word: {
        flex: 1,
    },
    keyboard: {
        alignSelf: 'flex-end',
    },
});

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {keys} = state;
    const keyboard = Keyboard.view(keys, (act : Keyboard.action) : void => next(Action(Actions.selectLetter, act)));
    const {myWord} = state;
    return (
        <View style={styles.container as any}>
            <TouchableHighlight style={styles.backButton} onPress={() => {next(Action(Actions.Done)); navigate(Page.pop()) }} >
                <View>
                    <Text> Done! </Text>
                </View>
            </TouchableHighlight>
            <View style={styles.word}>
                <Text>{myWord}</Text>
            </View>
            <View style={styles.keyboard as any}>{keyboard}</View>
        </View>
   );
};


export const component = {init, update, view} as Component<state, action, any>;
