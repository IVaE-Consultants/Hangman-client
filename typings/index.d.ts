/// <reference path="effectjs.d.ts" />
/// <reference path="globals/immutable/index.d.ts" />
/// <reference path="globals/react-native/index.d.ts" />
/// <reference path="globals/react/index.d.ts" />
declare module Immutable {
    export module Record {
        type IRecord<T> = T & TypedMap<T>;

        interface TypedMap<T> extends Map<string, any> {
            set(key: string, value: any): IRecord<T>;
            merge(...iterables: Iterable<string, any>[]): IRecord<T>;
            merge(...iterables: T[]): IRecord<T>;
        }

        interface Factory<T> {
            new (): IRecord<T>;
            new (values: any): IRecord<T>;

            (): IRecord<T>;
            (values: any): IRecord<T>;
        }
    }

    export function Record<T>(
        defaultValues: T, name?: string
    ): Record.Factory<T>;
}
