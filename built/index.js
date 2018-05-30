"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const sdb_ts_1 = require("sdb-ts");
const path = require("path");
const richText = require("rich-text");
const ReactDOMServer = require("react-dom/server");
const React = require("react");
const compile_ts_1 = require("./compile_ts");
const lodash_1 = require("lodash");
const PORT = 8000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sdbServer = new sdb_ts_1.SDBServer({ wss });
sdb_ts_1.SDBServer.registerType(richText.type);
const codeDoc = sdbServer.get('example', 'code');
const quillDoc = sdbServer.get('example', 'quill');
const stateDoc = sdbServer.get('example', 'state');
stateDoc.createIfEmpty({
    state: { x: '' }
});
codeDoc.createIfEmpty({ code: `
import * as React from 'react';

export default ({name}) => (
 <div>{\`Hi \${name}\`}</div>
);
` });
quillDoc.createIfEmpty([{ insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
` }], 'rich-text');
codeDoc.subscribe(lodash_1.throttle(() => {
    const data = codeDoc.getData();
    if (data) {
        try {
            const blotFunction = compile_ts_1.runTSCode(data.code).default;
            const x = ReactDOMServer.renderToString(React.createElement(blotFunction, { name: 'Steve' }));
            stateDoc.submitObjectInsertOp(['state', 'x'], x);
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