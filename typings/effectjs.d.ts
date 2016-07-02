declare namespace EffectJS {
    interface Component<S,A,V> {
        init : (...props: any[]) => Result<S, A>;
        update : (state : S, action : A) => Result<S, A>;
        view : (state : S, ...next : ((...a : any[]) => void)[]) => V;
        actions? : any;
    }
    interface Effect<A> {
        map?: <B>(f : ((a : A) => B)) => Effect<B>;
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
    function Result<S,A>(state :S, effect : Effect<A>) : Result<S,A & Effect<A>>
    function Result<S,A>(state :S) : Result<S,A & Effect<A>>

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

