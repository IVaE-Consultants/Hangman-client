import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';
import * as Game from './game';

const uuid = require('uuid');


enum Actions {
    stateChanged,
    delegate,
    done,
    move,
}
interface LetterAttrs{
    x?:number;
    y?:number;
    offsetX?:number;
    offsetY?:number;
    character?:string;
    id?:string;
};

type Letter = Record.IRecord<LetterAttrs>
const Letter = Record<LetterAttrs>({
    x:0,
    y:0,
    offsetX:0,
    offsetY:0,
    character:"f",
    id:undefined,
});
interface StateAttrs {
    reply? : Reply<any>;
    components?: Map<string, Component<any,any,any>>;
    states?: Map<string, any>;
    game?: Game.state;
    mappers?: Map<string, mapper>;
    letters?:List<Letter>;
}
const State = Record<StateAttrs>({
    reply: undefined,
    components: undefined,
    states: undefined,
    game: undefined,
    mappers: undefined,
    letters: undefined,
});

export type replies = Action<Replies, any>;
export const enum Replies {
    GameChanged,
}

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

type SubState = state  ;

export const init = (game : Game.state, reply? : Reply<any>) : result => {

    const letters = List<Letter>([
        Letter({id : uuid.v4(),character:"p"}),
        Letter({id : uuid.v4(),character:"a"}),
        Letter({id : uuid.v4(),character:"u"}),
        Letter({id : uuid.v4(),character:"l"}),
        ]);
    // Init subcomponents and map the effects
    const componentList : config<SubState, any>[] = [
   //     {component: Component1.component},
     //   {component: Component2.component}
    ];
    const {components, states, effects, mappers} = subComponentsInit(componentList);
    const effect = Effect.all(effects);
    const state = State({
        reply,
        components,
        states,
        mappers,
        game,
        letters,
    });
    return Result(state, effect);
};

export const update = (state : state, action : action) : result => {
    const {type, data} = action;
    if (type === Actions.stateChanged){
        // do something and return your new state and effects
        return Result(state, Effect.none);
    } else if (type === Actions.delegate) {
        const [states, effect] = handleDelagation(state, data);
        const nextState = state.merge({states});
        return Result(nextState, effect);
    } else if (type === Actions.done) {
        const {state:gameState, effect:gameEffect}  = Game.update(state.game, Action(Game.Actions.NextGameStep, undefined));
        const replyEffect = state.reply(Action(Replies.GameChanged ,gameState));
        //TODO: handle effects
        const newState = state.merge({game:gameState});
        return Result(newState, replyEffect);
    } else if (type == Actions.move){
        const {newLetter:letter} = data;
        const {letters} = state;
        const letterIndex = letters.findKey((item:Letter)=> item.id === letter.id);
        const newLetters = letters.remove(letterIndex).push(letter);
        const nextState = state.merge({letters: newLetters});
        return Result(nextState);
    }
    // TODO: change component to component name
    throw new Error(`Invalid action type in component: ${type}`);
};


import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';


const setPosition = (letter:Letter, next: (action : action)=> void) => (e:any) => {
    const pressX = e.nativeEvent.pageX as number;
    const pressY = e.nativeEvent.pageY as number;
    const {offsetX, offsetY, x, y} = letter;
    const newLetter = letter.merge({x:x+pressX-offsetX, y:y+pressY-offsetY, offsetX:pressX, offsetY:pressY});
    next(Action(Actions.move, {newLetter}));      
};
const setStartPosition = (letter:Letter, next: (action : action)=> void) => (e:any) =>{
    const x = e.nativeEvent.pageX as number;
    const y = e.nativeEvent.pageY as number;
    const newLetter = letter.merge({offsetX: x, offsetY: y});
    next(Action(Actions.move, {newLetter}));    
};

const returnTrue=() => { return true;};

const getTransform = (letter:Letter, state : state) =>{
    const transform = [{translateX: letter.x}, {translateY:letter.y}]
    return {transform:transform};
}

export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    const letterViews = state.letters.map(letter => {
                return (<View
                    onResponderMove={setPosition(letter, next)}
                    onResponderGrant={setStartPosition(letter, next)}
                    onStartShouldSetResponder={returnTrue}
                    onMoveShouldSetResponder={returnTrue}
                    style={[styles.tile, getTransform(letter, state)]}
                    key={letter.id}>
                    <Text style={[styles.letter]}>{letter.character}</Text>
                </View>)
            });
    return (
        <View>
            <View style={styles.container}>
                <TouchableHighlight style={styles.backButton} onPress={() => { next(Action(Actions.done)); navigate(Page.pop()) }} > 
                    <View>
                        <Text> Done! </Text>
                    </View>
                </TouchableHighlight>
            </View>
            {letterViews}
        </View>
   )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listView: {
        marginTop: 50,
        flex: 1,
    },
    backButton: {
        marginTop: 50,
        backgroundColor: '#00FF00',
    },    row: {
        height: 80,
        borderTopWidth: 1,
        borderColor: 'rgb(239,239,239)',
    },
    tile: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#BEE1D2",
        borderColor: "#222",
        borderWidth:2,
    },
    letter: {
        color: '#333',
        fontSize: 28,
        fontFamily: 'Arial',
        backgroundColor: 'transparent',
    },
});


export const component = {init, update, view} as Component<state, action, any>;