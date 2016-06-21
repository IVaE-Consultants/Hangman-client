import {Effect} from 'effectjs';

export function perform<V,A>( promise : Promise<V>, ok : ((value: V) => A), fail : ((error : any) => A) ) : A & Effect<A> {
    return Effect.call(() => {
        return promise
        .then(ok)
        .catch(fail);
    });
}
