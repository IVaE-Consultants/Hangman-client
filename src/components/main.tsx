import * as React from 'react';
import {Record, Map, List} from 'immutable';
import {Action, Effect, Result, Component} from 'effectjs';
import * as Page from './Page';
import * as Game from './game';
import * as Guess from './guess';
import {perform, range} from '../utils';


enum Actions {
    Game,
}

interface StateAttrs {
    games? : List<Game.state>;
}
const State = Record<StateAttrs>({
    games: List([]),
});

export type state = Record.IRecord<StateAttrs>;
export type action = Action<Actions, any>;
export type result = Result<state, action>;
const delay = (ms : number) : Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}

const gameAction = (index : number) => (action : Game.action) : action => Action(Actions.Game, {index, action});

export const init = () : result => {
    const results = range(0, 2).map(Game.init);
    const games = List(results.map(({state}) => state));
    const effects = results.map(({effect}, index) => effect.map(gameAction(index)));
    const effect = Effect.all(effects);
    const state = State({
        games,
    });
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.Game) {
        const {index, action} = data;
        const {games} = state;
        const {state: gameState, effect: gameEffect} = Game.update(games.get(index), action);
        const nextState = state.merge({
            games: games.set(index, gameState)
        });
        const effect = gameEffect.map(gameAction(index));
        return Result(nextState, effect);
    }
};

import {
    View,
    TouchableHighlight,
    Text,
} from 'react-native';

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {games} = state;
    return (
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 250,
            height: 150,
            backgroundColor: 'green',
        }} >
        {games.map((game : Game.state) => {
            return (<TouchableHighlight onPress={() => navigate(Page.push(Page.page.Guess, game.theirWord.word))}>
                <View>{Game.view(game)}</View>
            </TouchableHighlight>)
        })}
        </View>
   );
};

const component = {init,update,view} as Component<state, action, any>;
