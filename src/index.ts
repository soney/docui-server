import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';
import * as richText from 'rich-text';
import {CodeDoc, QuillDoc, StateDoc} from '../node_modules/docui/types/docTypes';
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

const displayCodeDoc:SDBDoc<CodeDoc> = sdbServer.get<CodeDoc>('example', 'display-code');
const backendCodeDoc:SDBDoc<CodeDoc> = sdbServer.get<CodeDoc>('example', 'backend-code');
const quillDoc:SDBDoc<QuillDoc> = sdbServer.get<QuillDoc>('example', 'quill');
const stateDoc:SDBDoc<StateDoc> = sdbServer.get<StateDoc>('example', 'state');

const backendCompiler = new TSXCompiler({
    sandbox: {}
});
stateDoc.createIfEmpty({
    state: { x: '' }
});
displayCodeDoc.createIfEmpty({ code: `
import * as React from 'react';

export default ({name}) => (
    <div>Hello!</div>
);
`});
backendCodeDoc.createIfEmpty({ code: `
import {InlineBlotDisplay} from './InlineBlotDisplay';
import * as React from 'react';

export default class MyDisplay extends InlineBlotDisplay {
    public render():React.ReactNode {
        return <div>Hello!</div>;
    };
};

export default ({name}) => (
 <div>{\`Hi \${name}\`}</div>
);
` });

quillDoc.createIfEmpty([{insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
`}], 'rich-text');


backendCodeDoc.subscribe(throttle(() => {
    const data = backendCodeDoc.getData();
    if(data) {
        const {code} = data;
        try {
            const result = backendCompiler.runTSXCode(code);
            console.log(result);
        } catch(e) {
        }
    }
}, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });

server.listen(PORT);
console.log(`Listening on port ${PORT}`);