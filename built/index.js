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
const InlineBlot_1 = require("./InlineBlot");
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
const backendCompiler = new compile_ts_1.TSXCompiler({
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
backendCodeDoc.subscribe(lodash_1.throttle(() => {
    const data = backendCodeDoc.getData();
    if (data) {
        const { code } = data;
        try {
            const result = backendCompiler.runTSXCode(code);
            console.log(result);
        }
        catch (e) {
        }
    }
}, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });
setTimeout(() => {
    const code = `
import {InlineBlotBackend, InlineBlotInterface} from './InlineBlot';

export default class WidgetBackend implements InlineBlotInterface {
    public constructor(private backend:InlineBlotBackend) {
    };
    public onAdded():void {
        this.backend.setState({
            abc: 10
        });
        console.log(this.backend.getState('abc'));
    };
    public onRemvoed():void {

    };
    public onTextContentChanged():void {

    };
};
`;
    const BackendClass = backendCompiler.runTSXCode(code)['default'];
    // console.log(BackendClass);
    const backend = new InlineBlot_1.InlineBlotBackend(stateDoc);
    const backendInstance = new BackendClass(backend);
    console.log(backendInstance.onAdded());
}, 300);
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map