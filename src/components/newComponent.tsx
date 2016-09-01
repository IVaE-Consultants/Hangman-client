/*import * as React from 'react';
import {Record, Map, List, is as immutableEqual} from 'immutable';
import {Action, Effect, Result, Component, Reply} from 'effectjs';
import * as Page from './Page';

const uuid = require('uuid');


enum Actions {
    stateChanged,
    delegate,
}

interface StateAttrs {
    reply? : Reply<any>;
    components?: Map<string, Component<any,any,any>>;
    states?: Map<string, any>;
    mappers?: Map<string, mapper>;
}
const State = Record<StateAttrs>({
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

type SubState = state  ;

export const init = (reply? : Reply<any>) : result => {

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
    }
    // TODO: change component to component name
    throw new Error(`Invalid action type in component: ${type}`);
};

import {
    View,
    Text,
    StyleSheet
} from 'react-native';



export const view = (state : state, next? : (action : action) => void, navigate? : (action : Page.action) => void) => {
    return (
        <View style={styles.container}>
            <Text> Main page </Text>
        </View>
   );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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


export const component = {init, update, view} as Component<state, action, any>;*/