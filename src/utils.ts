import {Effect} from 'effectjs';

export const range = (start : number, end : number, step? : number) : number[] => {
    step = step || 1;
    const result : number[] = [];
    let i : number;
    for(i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
}

export function perform<V,A>( promise : Promise<V>, ok : ((value: V) => A), fail : ((error : any) => A) ) : A & Effect<A> {
    return Effect.call(() => {
        return promise
        .then(ok)
        .catch(fail);
    });
}

export type Language = 'eng' | 'swe';

export const getAlphabet = (language: Language): string[] => {
    if (language == 'swe') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'];
    } else if (language == 'eng') {
        return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    }
    throw new Error('Not an available language: ' + language);
}