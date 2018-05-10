"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const sdb_ts_1 = require("sdb-ts");
const path = require("path");
const richText = require("rich-text");
const PORT = 8000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sdbServer = new sdb_ts_1.SDBServer({ wss });
sdb_ts_1.SDBServer.registerType(richText.type);
const codeDoc = sdbServer.get('example', 'code');
const quillDoc = sdbServer.get('example', 'quill');
codeDoc.createIfEmpty({ code: '' });
quillDoc.createIfEmpty([{ insert: 'Hi!' }], 'rich-text');
codeDoc.subscribe(() => {
    console.log(codeDoc.getData());
});
quillDoc.subscribe(() => {
    console.log(quillDoc.getData());
});
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map