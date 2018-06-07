import * as React from 'react';
import { StateDoc } from '../node_modules/docui/types/docTypes';
import { SDBDoc } from 'sdb-ts';
export declare abstract class InlineBlotDisplay {
    abstract render(): React.ReactNode;
}
export declare class InlineBlotBackend {
    private stateDoc;
    constructor(stateDoc: SDBDoc<StateDoc>);
    setState(state: {
        [key: string]: any;
    }): void;
    getState(key: string): any;
}
export interface InlineBlotInterface {
    constructor(backend: InlineBlotBackend): void;
    onTextContentChanged(): void;
    onAdded(): void;
    onRemoved(): void;
}
