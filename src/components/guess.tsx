import * as React from 'react';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import {Record, Map, List} from 'immutable';
import * as Game from './game';
import * as Keyboard from './keyboard';


import {
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    Image,
    Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const enum Actions {
    GuessLetter,
    Never,
}

interface StateAttrs {
    game?: Game.state;
    unknown?: number;
    revealed?: string[];
    firstKnown?: number;
    lastKnown?: number;
    keyboardKeys?: List<Keyboard.Key>;
    reply? : Reply<any>;
}
const State = Record<StateAttrs>({
    game: undefined,
    unknown: undefined,
    revealed: undefined,
    firstKnown: undefined,
    lastKnown: undefined,
    keyboardKeys: undefined,
    reply: undefined,
});

type state = Record.IRecord<StateAttrs>;
type action = Action<Actions.GuessLetter,Keyboard.action>;
type result = Result<state,action>;
type Letter = string;

export type replies = gameChangedAction;
type gameChangedAction = Action<Replies.GameChanged, Game.state>;
export const enum Replies {
    GameChanged,
    Never,//Tagged unions require enums with multiple options
}

// type as Game component
export const init = (game : Game.state, reply : Reply<any>) : result => {
    const word = game.roundStates!.get(game.round!).theirWord!.word!;
    const alphabet = Keyboard.getAlphabet();
    const keyboardKeys = Keyboard.createKeys((text : string) => {
        return Keyboard.Key({text});
    })(alphabet);
    const nextState = State({
        game,
        reply,
        unknown: word.length,
        revealed: [...Array(word.length+1).join('?')],
        keyboardKeys,
    });
    return Result(nextState, Effect.none);
};

export const update = (state: state, action: action): result => {
    const {type, data} = action;
    const game = state.game!;
    switch (action.type) {
        case Actions.GuessLetter: {
            // data is Action(Keyboard.Actions.Disable, char)
            const {data: key} = data as Keyboard.pressAction;
            // update keyboard
            //const {state: nextKeyboardState, effect: keyboardEffects} = Keyboard.update(state.keyboardState, data);

            // letter that was guessed
            let letter = key.text!.toUpperCase();
            const round = game.round!
            const roundStates = game.roundStates!
            let {revealed, unknown, firstKnown, lastKnown} = state;
            const word = game.roundStates!.get(game.round!).theirWord!.word!;
            let chars = [...word];

            // if already guessed letter, do nothing
            if (roundStates!.get(round).guessedLetters!.get(letter)) {
                console.log("already guessed that letter");
                return Result(state);
            }
            //Evaluate if correct or not
            const positions = chars.reduce((acc: number[], char: string, i: number) => {
                if (char === letter) {
                    acc.push(i);
                }
                return acc;
            }, []);
            if (positions.length > 0 && firstKnown == undefined) {
                firstKnown = positions[0];
                lastKnown = positions[0];
            }
            const color = positions.length > 0 ? '#00ff00' : '#ff0000';

            let max = Math.max.apply(null, positions);
            let min = Math.min.apply(null, positions);
            // ensure no overflow
            max = Math.min(max + 1, word.length);
            min = Math.max(min - 1, 0);
            lastKnown = (max > lastKnown) ? max : lastKnown;
            firstKnown = (min < firstKnown) ? min : firstKnown;
            // update revealed
            revealed = revealed!.map((curr: string, index: number) => {
                if (positions.includes(index)) {
                    return chars[index];
                }
                // reveal the number of letters between the known
                if (index > firstKnown && index < lastKnown && curr == '?') {
                    return '*';
                }
                // reveal next to the first or last known to hint that word is longer
                if ((positions.includes(index + 1) || positions.includes(index - 1)) && curr == '?') {
                    return '*';
                }
                return curr;
            });
            unknown -= positions.length;

            // update guessed
            let newRoundStates = roundStates.setIn([round, 'guessedLetters', letter], true);
            const tries = roundStates.get(round).triesLeft;
            // update misses
            if (positions.length == 0) {
                newRoundStates = newRoundStates.setIn([round, 'triesLeft'], tries - 1);
            }
            const newGameState = game.merge({ roundStates: newRoundStates });
            //
            // return a new state
            const {reply} = state;
            const newState = state.merge({ game: newGameState, revealed, unknown, firstKnown, lastKnown });
            const effect = reply!(Action(Replies.GameChanged, newGameState));
            return Result(newState, effect);
        }
    }
};

// width and height null on bg : http://stackoverflow.com/questions/30273624/how-to-stretch-a-static-image-as-background-in-react-native
const styles = StyleSheet.create({
    backgroundImage: {
        width,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    backContainer: {
        width: 50,
        height: 50,
    },
    backText: {
        fontSize: 32,
        fontWeight: '300',
        textAlign: 'center',
    },
});

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const keys = state.keyboardKeys!;
    const game = state.game!;
    const round = game.round!;
    const testboard = Keyboard.view(keys, (act : Keyboard.action) : void => next!(Action<Actions.GuessLetter, Keyboard.action>(Actions.GuessLetter, act)));
    const {triesLeft} = game.roundStates!.get(round);
    let {revealed, unknown, firstKnown, lastKnown} = state;
    const word = game.roundStates!.get(round).theirWord!.word;
    let visible : any;
    console.log('THE ACTUAL KEYBOARD', testboard);
    // have to check undefined cause firstknown can be 0
    if(firstKnown!=undefined){
        visible = revealed!.slice(firstKnown, lastKnown+1);
    }

    let info = <View>
                <Text> Tries left: {triesLeft} </Text>
                <Text> {visible} </Text>
           </View>
    if (triesLeft == 0){
        // Update gameState to be complete but also lost
        info = <View>
                <Text> You Lost! Correct word was: </Text>
               <Text> {word} </Text>
           </View>
    }
    if (unknown == 0){
        // Update gameState to be complete and won
        info = <View>
                <Text> YOU WON! Word was: </Text>
               <Text> {word} </Text>
           </View>
    }

    return (
        <Image source={require('../../static/GuessBg.jpg')} style={styles.backgroundImage} >
        <View style={styles.container as any}>
            <TouchableHighlight onPress={()=> navigate!(Page.pop())}>
            <View style={styles.backContainer}>
                <Text style={styles.backText as any}>{'<'}</Text>
            </View>
            </TouchableHighlight>
            {info}
            <View>
                    {testboard}
            </View>
        </View>
        </Image>
   );
};

export const component = {init,update,view} as Component<state, action, any>;
