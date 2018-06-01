"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const sdb_ts_1 = require("sdb-ts");
const path = require("path");
const richText = require("rich-text");
const compile_ts_1 = require("./compile_ts");
const lodash_1 = require("lodash");
const PORT = 8000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sdbServer = new sdb_ts_1.SDBServer({ wss });
sdb_ts_1.SDBServer.registerType(richText.type);
const displayCodeDoc = sdbServer.get('example', 'display-code');
const backendCodeDoc = sdbServer.get('example', 'backend-code');
const quillDoc = sdbServer.get('example', 'quill');
const stateDoc = sdbServer.get('example', 'state');
stateDoc.createIfEmpty({
    state: { x: '' }
});
displayCodeDoc.createIfEmpty({ code: `
import * as React from 'react';

export default ({name}) => (
    <div>Hello!</div>
);
` });
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
quillDoc.createIfEmpty([{ insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
` }], 'rich-text');
displayCodeDoc.subscribe(lodash_1.throttle(() => {
    const data = displayCodeDoc.getData();
    if (data) {
        try {
            const blotDisplay = compile_ts_1.tsCompiler(data.code);
            console.log(blotDisplay);
            // const x = ReactDOMServer.renderToString(React.createElement(blotFunction, { name: 'Steve' }));
            // stateDoc.submitObjectInsertOp(['state', 'x'], x);
        }
        catch (e) {
            console.error(e);
        }
    }
}, 1000));
backendCodeDoc.subscribe(lodash_1.throttle(() => {
    const data = backendCodeDoc.getData();
    if (data) {
        try {
            const blotDisplay = compile_ts_1.runTSCode(data.code).default;
            // const x = ReactDOMServer.renderToString(React.createElement(blotFunction, { name: 'Steve' }));
            // stateDoc.submitObjectInsertOp(['state', 'x'], x);
        }
        catch (e) {
            console.error(e);
        }
    }
}, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map