import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';
import * as richText from 'rich-text';
import {CodeDoc, QuillDoc, StateDoc} from '../node_modules/docui/types/docTypes';
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import {runTSCode} from './compile_ts';
import {throttle} from 'lodash';
import * as Quill from 'quill';
import { JSDOM } from 'jsdom';

const PORT:number = 8000;

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});

SDBServer.registerType(richText.type);

const codeDoc:SDBDoc<CodeDoc> = sdbServer.get<CodeDoc>('example', 'code');
const quillDoc:SDBDoc<QuillDoc> = sdbServer.get<QuillDoc>('example', 'quill');
const stateDoc:SDBDoc<StateDoc> = sdbServer.get<StateDoc>('example', 'state');

stateDoc.createIfEmpty({
    state: { x: '' }
});
codeDoc.createIfEmpty({ code: `
import * as React from 'react';

export default ({name}) => (
 <div>{\`Hi \${name}\`}</div>
);
` });

quillDoc.createIfEmpty([{insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
`}], 'rich-text');


codeDoc.subscribe(throttle(() => {
    const data = codeDoc.getData();
    if(data) {
        try {
            const blotFunction = runTSCode(data.code).default;
            const x = ReactDOMServer.renderToString(React.createElement(blotFunction, { name: 'Steve' }));
            stateDoc.submitObjectInsertOp(['state', 'x'], x);
        } catch(e) {
            console.error(e);
        }
    }
}, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });

server.listen(PORT);
console.log(`Listening on port ${PORT}`);