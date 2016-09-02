declare namespace EffectJS {
    type Reply<A> = ((action : Action<any, any>) => Effect<Action<any, Action<any, A>>>);
    interface Component<S,A,V> {
        init : (data? : any, reply? : Reply<any>) => Result<S, A>;
        update : (state : S, action : A) => Result<S, A>;
        view : (state : S, ...next : ((...a : any[]) => void)[]) => V;
        actions? : any;
    }
    interface Effect<A> {
        map: <B>(f : ((a : A) => B)) => Effect<B>;
    }
    namespace Effect {
        var none: Effect<any>;
        function all<A>(effects : Effect<A>[]) : Effect<A>;
    }
    function Effect<A>(action : A) : Effect<A>

    interface Result<S,A> {
        state: S;
        effect: Effect<A>;
    }
    function Result<S,A>(state :S, effect : Effect<A>) : Result<S,A>
    function Result<S,A>(state :S) : Result<S,A>

    
    interface Action<K,V> {
        type : K;
        data : V;
    }
    function Action<K,V>(type : K, data: V) : Action<K,V>
    function Action<K>(type : K) : Action<K, undefined>
}

declare module "effectjs" {
    export = EffectJS
}

