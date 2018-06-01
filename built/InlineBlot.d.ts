import * as React from 'react';
export declare abstract class InlineBlotDisplay {
    abstract render(): React.ReactNode;
}
export declare abstract class InlineBlotBackend {
    constructor();
    setState(state: {
        [key: string]: any;
    }): void;
}
