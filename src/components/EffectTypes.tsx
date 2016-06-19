export interface ComponentT<A,S,V> {
    init : (...props: any[]) => ResultT<S,EffectT<A>>;
    update : (state : S, action : ActionT<A, any>) => ResultT<S,EffectT<A>>;
    view : (state : S, ...next : ((action : ActionT<A,any>) => void)[]) => React.ReactElement<V>;
};

export interface EffectT<A> {
    none: EffectT<A>;
    create: EffectT<A>;
    map: <B>(g : (f : ((a : A) => B)) => EffectT<A>) => EffectT<B>;
}

// const effect2 = Effect.map(f)(effect);

export interface ResultT<S,A> {
    state: S;
    effect: EffectT<A>;
};

export interface ActionT<K,V> {
    type : K;
    data : V;
}

