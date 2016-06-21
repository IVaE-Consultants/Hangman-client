declare namespace EffectJS {
    interface Component<A,S,V> {
        init : (...props: any[]) => Result<S,Effect<A>>;
        update : (state : S, action : Action<A, any>) => Result<S,Effect<A>>;
        view : (state : S, ...next : ((action : Action<A,any>) => void)[]) => React.ReactElement<V>;
    }

    interface Effect<A> {
        create: Effect<A>;
        map: <B>(f : ((a : A) => B)) => Effect<B>;
    }
    namespace Effect {
        var none: Effect<any>;
    }
    function Effect<A>(action : A) : Effect<A>

    interface Result<S,A> {
        state: S;
        effect: Effect<A>;
    }
    function Result<S,A>(state :S, effect : Effect<A>) : Result<S,A>
    function Result<S,A>(state :S) : Result<S,Effect<A>>

    interface Action<K,V> {
        type : K;
        data : V;
    }
    function Action<K,V>(type : K, data: V) : Action<K,V>
    function Action<K,V>(type : K) : Action<K,V>
}

declare module "effectjs" {
    export = EffectJS
}

