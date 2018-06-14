import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';
import * as richText from 'rich-text';
import {DisplayCodeDoc, BackendCodeDoc, QuillDoc, StateDoc, FormatDoc} from '../node_modules/docui/types/docTypes';
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import {TSXCompiler} from './compile_ts';
import {throttle, has} from 'lodash';
import * as Quill from 'quill';
import { JSDOM } from 'jsdom';
import {InlineBlotDisplay, InlineBlotBackend} from './backend_utilities/InlineBlot';
import * as ts from 'typescript';

const PORT:number = 8000;

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
app.use('/node_modules', express.static(path.resolve(__dirname, '..', 'node_modules')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});

const backendClasses:Map<string, any> = new Map<string, any>();
const backendInstances:Map<string, any> = new Map<string, any>();

function getBackendInstance(blotId:string):any {
    return backendInstances.get(blotId);
}
function setBackendInstance(formatId:string, blotId:string, backendInstance:any):void {
    backendInstances.set(blotId, backendInstance);
    if(backendInstance) {
        backendInstance.onAdded();
    }
}
function setBackendClass(formatId:string, value:any):void {
    backendClasses.set(formatId, value);
}
function getBackendClass(formatId:string):any {
    return backendClasses.get(formatId);
}

SDBServer.registerType(richText.type);

const formatsDoc:SDBDoc<FormatDoc> = sdbServer.get<FormatDoc>('docui', 'formats');
const quillDoc:SDBDoc<QuillDoc> = sdbServer.get<QuillDoc> ('docs', 'example');
formatsDoc.createIfEmpty({formats: {}});
quillDoc.createIfEmpty([{insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
`}], 'rich-text');

const backendCompiler = new TSXCompiler({
    sandbox: {}
});
const displayCompiler = new TSXCompiler({
    sandbox: {}
}, {
    module: ts.ModuleKind.None
});


function updateBackendCode(formatId:string) {
    const formatP = ['formats', formatId];
    const backendCodeP = formatP.concat('backendCode');

    const format = formatsDoc.traverse(formatP);
    const {name, backendCode} = format;
    try {
        const backendCodeResult = backendCompiler.runTSXCode(backendCode.code);
        if(!has(backendCodeResult, 'default')) {
            throw new Error('Could not find default export');
        }
        const BackendClass = backendCodeResult['default'];
        setBackendClass(formatId, BackendClass);
        formatsDoc.submitObjectReplaceOp(backendCodeP.concat('error'), null);
    } catch(e) {
        formatsDoc.submitObjectReplaceOp(backendCodeP.concat('error'), `${e}`);
    }
}
function updateDisplayCode(formatId:string) {
    const formatP = ['formats', formatId];
    const displayCodeP = formatP.concat('displayCode');

    const format = formatsDoc.traverse(formatP);
    const {name, displayCode} = format;
    try {
        const jsDisplayCode = displayCompiler.transpileTSXCode(displayCode.code);
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('jsCode'), jsDisplayCode);
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('error'), null);
    } catch(e) {
        formatsDoc.submitObjectReplaceOp(displayCodeP.concat('error'), `${e}`);
    }
}

formatsDoc.subscribe((type, ops) => {
    const data = formatsDoc.getData();
    if(data) {
        if(type === 'op') {
            const {formats} = data;
            ops.forEach((op) => {
                const {p} = op;
                if(p.length === 2 && p[0] === 'formats' && has(op, 'oi') && !has(op, 'od')) { // new format added
                    const formatId:string = p[1];
                    updateDisplayCode(formatId);
                    updateBackendCode(formatId);
                } else if(p.length === 5 && p[3] === 'code' && (has(op, 'si') || has(op, 'sd'))) { //modified
                    const isBackend = p[2] === 'backendCode';
                    const formatId:string = p[1];
                    if(isBackend) {
                        updateBackendCode(formatId);
                    } else {
                        updateDisplayCode(formatId);
                    }
                } else if(p.length === 4 && p[2]==='blots' && has(op, 'oi'))  { // blot added
                    const {state} = op.oi;
                    const formatId = p[1];
                    const blotId = p[3];

                    const BackendClass = getBackendClass(formatId);
                    if(BackendClass) {
                        const backendInstance = new BackendClass(new InlineBlotBackend(formatsDoc, formatId, blotId))
                        setBackendInstance(formatId, blotId, backendInstance);
                    }
                } else if(p.length === 5 && p[4] === 'textContent' && has(op, 'oi')) {
                    const {oi} = op;
                    const formatId = p[1];
                    const blotId = p[3];

                    const backendInstance = getBackendInstance(blotId);
                    if(backendInstance && backendInstance.onTextContentChanged) {
                        try {
                            backendInstance.onTextContentChanged(oi);
                        } catch(e) {
                            console.error(e);
                        }
                    }
                }
            });
        }
    }
});

server.listen(PORT);
console.log(`Listening on port ${PORT}`);