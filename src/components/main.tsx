import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
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
    dataSource? : any;
}
const State = Record<StateAttrs>({
    games: List([]),
    dataSource: List([]),
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
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !immutableEqual(r1, r2)});
    const results = range(0, 2).map(Game.init);
    const games = List(results.map(({state}) => state));
    const effects = results.map(({effect}, index) => effect.map(gameAction(index)));
    const effect = Effect.all(effects);
    const state = State({
        games,
        dataSource: ds.cloneWithRows(games.toArray()),
    });
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.Game) {
        const {index, action} = data;
        const {games, dataSource} = state;
        const {state: gameState, effect: gameEffect} = Game.update(games.get(index), action);
        const nextGames = games.set(index, gameState);
        const nextState = state.merge({
            games: nextGames,
            dataSource: dataSource.cloneWithRows(nextGames.toArray())
        });
        const effect = gameEffect.map(gameAction(index));
        return Result(nextState, effect);
    }
};

import {
    View,
    TouchableHighlight,
    Text,
    ListView,
} from 'react-native';

const renderRow = (navigate: (action : Page.action) => void) => (game: Game.state) => {
    console.log(game);
    return (<TouchableHighlight onPress={() => navigate(Page.push(Page.page.Guess, game.theirWord.word))}>
        <View>{Game.view(game)}</View>
    </TouchableHighlight>)
}

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {games, dataSource} = state;
    return (
        <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
            width: 250,
            height: 150,
            backgroundColor: 'green',
        }} >
            <ListView
                dataSource={dataSource}
                renderRow={(game) => renderRow(navigate)(game)}
            />
        </View>
   );
};

const component = {init,update,view} as Component<state, action, any>;
