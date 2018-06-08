import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';
import * as richText from 'rich-text';
import {DisplayCodeDoc, BackendCodeDoc, QuillDoc, StateDoc} from '../node_modules/docui/types/docTypes';
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import {TSXCompiler} from './compile_ts';
import {throttle} from 'lodash';
import * as Quill from 'quill';
import { JSDOM } from 'jsdom';
import {InlineBlotDisplay, InlineBlotBackend} from './InlineBlot';

const PORT:number = 8000;

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});

SDBServer.registerType(richText.type);

const displayCodeDoc:SDBDoc<DisplayCodeDoc> = sdbServer.get<DisplayCodeDoc>('example', 'display-code');
const backendCodeDoc:SDBDoc<BackendCodeDoc> = sdbServer.get<BackendCodeDoc>('example', 'backend-code');
const quillDoc:SDBDoc<QuillDoc> = sdbServer.get<QuillDoc>('example', 'quill');
const stateDoc:SDBDoc<StateDoc> = sdbServer.get<StateDoc>('example', 'state');

const backendCompiler = new TSXCompiler({
    sandbox: {}
});
const displayCompiler = new TSXCompiler({
    sandbox: {}
});
stateDoc.createIfEmpty({
    state: { x: '' }
});
displayCodeDoc.createIfEmpty({ code: `
export default class WidgetDisplay {
    public constructor(private displayBackend) {

    };
    public render():React.ReactNode {
        const abc = this.displayBackend.getState('abc');
        const greeting = 'hello';
        return <div>{greeting} {abc}</div>;
    };
};
`});
backendCodeDoc.createIfEmpty({ code: `
` });

quillDoc.createIfEmpty([{insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
`}], 'rich-text');


displayCodeDoc.subscribe(throttle((type:string, ops) => {
    const data = displayCodeDoc.getData();
    if(data) {
        if(type === "create" || (type === "op" && ops[0].p[0]==='code')) {
            const {code} = data;
            try {
                const jsCode = displayCompiler.transpileTSXCode(code);
                displayCodeDoc.submitObjectReplaceOp(['jsCode'], jsCode);
                console.log(jsCode);
            } catch(e) {
            }
        }
    }
}, 1000));
backendCodeDoc.subscribe(throttle(() => {
    const data = backendCodeDoc.getData();
    if(data) {
        const {code} = data;
        try {
            const result = backendCompiler.runTSXCode(code);
        } catch(e) {
        }
    }
}, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });

setTimeout(() => {
    const code = `
import {InlineBlotBackend, InlineBlotInterface} from './InlineBlot';

export default class WidgetBackend implements InlineBlotInterface {
    private abc:number = 0;
    public constructor(private backend:InlineBlotBackend) {
    };

    public onAdded():void {
        this.interval = setInterval(() => {
            this.abc++;
            // console.log(this.abc);
            this.backend.setState({
                abc: this.abc
            });
        }, 2000);
    };

    public onRemoved():void {
        clearInterval(this.interval);
    };

    public onTextContentChanged():void {

    };
};
`;
    const BackendClass = backendCompiler.runTSXCode(code)['default'];
    const backend = new InlineBlotBackend(stateDoc);
    const backendInstance = new BackendClass(backend);
    console.log(backendInstance.onAdded());
}, 300);

server.listen(PORT);
console.log(`Listening on port ${PORT}`);