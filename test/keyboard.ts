import test from 'ava';
import {List} from 'immutable';
import {view, getAlphabet, disableKey, createKeys, Key} from '../src/components/keyboard';

test((t : any) => {
    const texts = [...'ABC'];
    const buttons = createKeys((text : string) => {
        return Key({text});
    })(texts);

    t.true(List([
        Key({text: 'A'}),
        Key({text: 'B'}),
        Key({text: 'C'}),
    ]).equals(buttons));
});
