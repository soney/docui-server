import * as React from 'react';
import { FormatDoc } from '../node_modules/docui/types/docTypes';
import { SDBDoc } from 'sdb-ts';
export declare abstract class InlineBlotDisplay {
    abstract render(): React.ReactNode;
}
export declare class InlineBlotBackend {
    private formatsDoc;
    private formatId;
    private blotId;
    constructor(formatsDoc: SDBDoc<FormatDoc>, formatId: string, blotId: string);
    getTextContent(): string;
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
