import { render } from "react-dom";
import * as React from 'react';
import * as ReactDOM from 'react';
import { StateDoc, FormatDoc } from '../node_modules/docui/types/docTypes';
import { SDBServer, SDBDoc } from 'sdb-ts';
import { each, has } from 'lodash';

export abstract class InlineBlotDisplay {
    public abstract render():React.ReactNode;
};

export class InlineBlotBackend {
    public constructor(private formatsDoc:SDBDoc<FormatDoc>, private formatId:string, private blotId:string) {
    };

    public setState(state:{[key:string]:any}):void {
        each(state, (value:any, key:string) => {
            this.formatsDoc.submitObjectReplaceOp(['formats', this.formatId, 'blots', this.blotId, 'state', key], value);
        });
    };

    public getState(key:string):any {
        const {formats} = this.formatsDoc.getData();
        const {state} = formats[this.formatId].blots[this.blotId];
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