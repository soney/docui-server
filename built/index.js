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
const ts = require("typescript");
const PORT = 8000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sdbServer = new sdb_ts_1.SDBServer({ wss });
const backendClasses = new Map();
const backendInstances = new Map();
function setBackendInstance(blotId, backendInstance) {
    backendInstances.set(blotId, backendInstance);
    if (backendInstance) {
        backendInstance.onAdded();
    }
}
function setBackendClass(formatId, value) {
    backendClasses.set(formatId, value);
}
function getBackendClass(formatId) {
    return backendClasses.get(formatId);
}
sdb_ts_1.SDBServer.registerType(richText.type);
const formatsDoc = sdbServer.get('docui', 'formats');
const quillDoc = sdbServer.get('docs', 'example');
formatsDoc.createIfEmpty({ formats: {} });
quillDoc.createIfEmpty([{ insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
` }], 'rich-text');
const backendCompiler = new compile_ts_1.TSXCompiler({
    sandbox: {}
});
const displayCompiler = new compile_ts_1.TSXCompiler({
    sandbox: {}
}, {
    module: ts.ModuleKind.None
});
function updateBackendCode(formatId) {
    const formatP = ['formats', formatId];
    const backendCodeP = formatP.concat('backendCode');
    const format = formatsDoc.traverse(formatP);
    const { name, backendCode } = format;
    try {
        const backendCodeResult = backendCompiler.runTSXCode(backendCode.code);
        if (!lodash_1.has(backendCodeResult, 'default')) {
            throw new Error('Could not find default export');
        }
        const BackendClass = backendCodeResult['default'];
        setBackendClass(formatId, BackendClass);
        formatsDoc.submitObjectReplaceOp(backendCodeP.concat('error'), null);
    }
    catch (e) {
        formatsDoc.submitObjectReplaceOp(backendCodeP.concat('error'), `${e}`);
        console.error(e);
    }
}
function updateDisplayCode(formatId) {
    const formatP = ['formats', formatId];
    const displayCodeP = formatP.concat('displayCode');
    const format = formatsDoc.traverse(formatP);
    const { name, displayCode } = format;
    try {
        const jsDisplayCode = displayCompiler.transpileTSXCode(displayCode.code);
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('jsCode'), jsDisplayCode);
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('error'), null);
    }
    catch (e) {
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('error'), `${e}`);
    }
}
formatsDoc.subscribe((type, ops) => {
    const data = formatsDoc.getData();
    if (data) {
        if (type === 'op') {
            const { formats } = data;
            ops.forEach((op) => {
                if (op.p.length === 2 && op.p[0] === 'formats' && lodash_1.has(op, 'oi') && !lodash_1.has(op, 'od')) { // new format added
                    const formatId = op.p[1];
                    updateDisplayCode(formatId);
                    updateBackendCode(formatId);
                }
                else if (op.p.length === 5 && op.p[3] === 'code' && (lodash_1.has(op, 'si') || lodash_1.has(op, 'sd'))) { //modified
                    const isBackend = op.p[2] === 'backendCode';
                    const formatId = op.p[1];
                    if (isBackend) {
                        updateBackendCode(formatId);
                    }
                    else {
                        updateDisplayCode(formatId);
                    }
                }
                else if (op.p.length === 4 && op.p[2] === 'blots' && lodash_1.has(op, 'oi')) { // blot added
                    const { state } = op.oi;
                    const formatId = op.p[1];
                    const blotId = op.p[3];
                    const BackendClass = getBackendClass(formatId);
                    if (BackendClass) {
                        const backendInstance = new BackendClass(new InlineBlot_1.InlineBlotBackend(formatsDoc, formatId, blotId));
                        setBackendInstance(blotId, backendInstance);
                    }
                }
            });
        }
    }
});
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map