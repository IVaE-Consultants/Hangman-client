import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import * as Game from './game';
import * as Guess from './guess';
import * as CreateWord from './createWord';
import * as LetterSelector from './letterSelector';
import {perform, range} from '../utils';

import {
    View,
    TouchableHighlight,
    Text,
    ListView,
    StyleSheet
} from 'react-native';

const uuid = require('uuid');


enum Actions {
    Game,
    Guess,
    CreateGame,
    Delegate,
    CreateWord,
    GameChanged,
    SelectLetters,
}


interface StateAttrs {
    games : List<Game.state >;
    dataSource : any;
}
const State = Record<StateAttrs>({
    games: List([]),
    dataSource: List([]),
});

export type state = Record.IRecord<StateAttrs>;

type gameAction = Action<Actions.Game, {id:string, action:Game.action} >;
type letterSelectorAction = Action<Actions.SelectLetters, LetterSelector.replies >;
type guessAction = Action<Actions.Guess, Guess.replies >;
type createWordAction = Action<Actions.CreateWord, CreateWord.replies >;
type createGameAction = Action<Actions.CreateGame, undefined >;
type otherAction = Action<Actions.Delegate, undefined >;

export type action = gameAction | guessAction | letterSelectorAction | createWordAction | createGameAction;
export type result = Result<state, action>;

const gameAction = (id : string) => (action : Game.action) : action =>
    Action<Actions.Game, any>(Actions.Game, {id, action});

const updateGame = (state:state, newGameState: any) => {
    // find game to update in games list
    const index = state.games.findKey((game) => game!.id == newGameState.id);
    const nextGames = state.games.set(index, newGameState);
    const nextState = state.merge({
        games: nextGames,
        dataSource: state.dataSource.cloneWithRows(nextGames.toArray()),
    });
    return Result(nextState);
};

export const init = () : result => {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !immutableEqual(r1, r2)});
    const state = State({
        dataSource: ds,
    });
    return Result(state, Effect.none);
};








export const update = (state: state, outerAction: action): result => {
    switch (outerAction.type) {
        case Actions.Game: {
            const {id, action} = outerAction.data;
            const {games, dataSource} = state;
            const index = state.games.findKey((game) => game!.id == id);
            const {state: gameState, effect: gameEffect} = Game.update(games.get(index), action);
            const nextGames = games.set(index, gameState);
            const nextState = state.merge({
                games: nextGames,
                dataSource: dataSource.cloneWithRows(nextGames.toArray())
            });
            const effect = gameEffect.map(gameAction(id));
            return Result(nextState, effect);
        } case Actions.SelectLetters: {
            const replyAction = outerAction.data;
            switch (replyAction.type) {
                case LetterSelector.Replies.GameChanged: {
                    const {data: newGameState} = replyAction;
                    return updateGame(state, newGameState);
                }
            }
            throw new Error('Invalid reply from Guess to main');
        } case Actions.Guess: {
            const replyAction = outerAction.data;
            switch (replyAction.type) {
                case Guess.Replies.GameChanged: {
                    const {data: newGameState} = replyAction;
                    return updateGame(state, newGameState);
                }
            }
        } case Actions.CreateWord: {
            const replyAction = outerAction.data;
            switch (replyAction.type) {
                case CreateWord.Replies.GameChanged: {
                    const {data: newGameState} = replyAction;
                    // find game to update in games list
                    return updateGame(state, newGameState);
                }
            }
        } case Actions.CreateGame: {
            const id = uuid.v4();
            const {state: newGame, effect: gameEffect} = Game.init({ id, language: 'eng' });
            const newGameStates = state.games.push(newGame);
            const nextState = state.merge({
                games: newGameStates,
                dataSource: state.dataSource.cloneWithRows(newGameStates.toArray()),
            })
            const effects = Effect.all([gameEffect.map(gameAction(id))]);
            return Result(nextState, effects);
        }
    }
};

const pushGamePage = (game:Game.state) => {
    switch (game.step) {
        case Game.GameSteps.letterSelector:
            const selectLettersReply: Reply<action> = (reply: LetterSelector.replies) => Effect.call(() => 
                Action(Page.reply, Action(Page.page.Main, Action(Actions.SelectLetters, reply))));
            return Page.push(Page.page.LetterSelector, game, selectLettersReply);
        case Game.GameSteps.guessWord:
            const guessReply: Reply<action> = (reply: Guess.replies) => Effect.call(() => 
                Action(Page.reply, Action(Page.page.Main, Action(Actions.Guess, reply))));
            return Page.push(Page.page.Guess, game, guessReply);
        case Game.GameSteps.createWord:
        //TODO: lös det här utan att tvinga typ
            const createReply: Reply<action> = (reply: CreateWord.replies) =>
                Effect(Action(Page.reply, Action(Page.page.Main, Action<Actions.CreateWord, CreateWord.replies>(Actions.CreateWord, reply))));

            //const createReply: Reply<action> = (reply: CreateWord.replies) => 
            //    Effect(Action(Page.reply, Action(Page.page.Main, Action(Actions.CreateWord, reply))));
            return Page.push(Page.page.CreateWord, game, createReply);
        //case Game.GameSteps.complete: return Page.push( Page.page.Guess, game, createReply);
    }
    throw new Error("Should not come here")
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createButton: {
        marginTop: 50,
        backgroundColor: '#00FF00',
    },
    listView: {
        marginTop: 50,
        flex: 1,
    },
    row: {
        height: 80,
        borderTopWidth: 1,
        borderColor: 'rgb(239,239,239)',
    },
})

const renderRow = (navigate: (action : Page.action) => void) => (game: Game.state) => {
    
    return (
        <TouchableHighlight onPress={() => navigate(pushGamePage(game))}>
            <View style={styles.row}>
                {Game.view(game)}
            </View>
        </TouchableHighlight>
    );
}

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const {games, dataSource} = state;
    const createGame = Action<Actions.CreateGame>(Actions.CreateGame);
    return (
        <View style={styles.container} >
            <TouchableHighlight style={styles.createButton} onPress={() => next!(createGame)} >
                <View>
                    <Text> New game </Text>
                </View>
            </TouchableHighlight>
            <ListView
                style={styles.listView}
                dataSource={dataSource}
                renderRow={(game) => renderRow(navigate!)(game)}
            />
        </View>
   );
};


export const component = {init,update,view} as Component<state, action, any>;
