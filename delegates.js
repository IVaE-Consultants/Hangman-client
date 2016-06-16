import {Action, Result, Effect} from 'effectjs';
import {setFields} from '../objects.js';

export const delegate = (state, action, key, component) => {
    const subAction = Action.unwrap(action);
    const {state: subState, effect: subEffect} = component.update(state[key], subAction);
    const obj = {};
    obj[key] = subState;
    const nextState = setFields(state)(obj);
    return Result(nextState, subEffect.map(Action.wrap(key)));
}
