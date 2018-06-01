import { render } from "react-dom";
import * as React from 'react';
import * as ReactDOM from 'react';

export abstract class InlineBlotDisplay {
    public abstract render():React.ReactNode;
};

export abstract class InlineBlotBackend {
    public constructor() {
    };
    public setState(state:{[key:string]:any}):void {
    };
};