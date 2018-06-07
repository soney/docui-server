import { render } from "react-dom";
import * as React from 'react';
import * as ReactDOM from 'react';
import { StateDoc } from '../node_modules/docui/types/docTypes';
import { SDBServer, SDBDoc } from 'sdb-ts';
import { each, has } from 'lodash';

export abstract class InlineBlotDisplay {
    public abstract render():React.ReactNode;
};

export class InlineBlotBackend {
    public constructor(private stateDoc:SDBDoc<StateDoc>) {
    };
    public setState(state:{[key:string]:any}):void {
        each(state, (value:any, key:string) => {
            this.stateDoc.submitObjectReplaceOp(['state', key], value);
        });
    };
    public getState(key:string):any {
        const {state} = this.stateDoc.getData();
        if(has(state, key)) {
            return state[key];
        } else {
            return null;
        }
    };
};

export interface InlineBlotInterface {
    constructor(backend:InlineBlotBackend):void;
    onTextContentChanged():void;
    onAdded():void;
    onRemoved():void;
}; 