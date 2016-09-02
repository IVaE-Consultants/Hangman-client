import test from 'ava';
import {List} from 'immutable';
import {init, view, update} from '../src/components/game';

(<any>global).fetch = (url : string) => Promise.resolve({
    status: 200,
    json() {
        const data =  {};
        return Promise.resolve(data);
    },
    text() {
        const text = '';
        return Promise.resolve(text);
    }
});

test((t : any) => {
    const {state} = init({id: 'id', language: 'eng'});
});
