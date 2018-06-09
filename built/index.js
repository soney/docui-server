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
const ts = require("typescript");
const PORT = 8000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sdbServer = new sdb_ts_1.SDBServer({ wss });
const backendClasess = new Map();
function setBackendClass(name, value) {
    backendClasess.set(name, value);
}
function getBackendClass(name) {
    return backendClasess.get(name);
}
sdb_ts_1.SDBServer.registerType(richText.type);
const formatsDoc = sdbServer.get('docui', 'formats');
const quillDoc = sdbServer.get('docs', 'example');
formatsDoc.createIfEmpty({ formats: [] });
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
function updateBackendCode(index) {
    const data = formatsDoc.getData();
    const p = ['formats', index, 'backendCode'];
    const backendCode = data.formats[index].backendCode.code;
    const name = data.formats[index].name;
    try {
        const backendCodeResult = backendCompiler.runTSXCode(backendCode);
        if (!lodash_1.has(backendCodeResult, 'default')) {
            throw new Error('Could not find default export');
        }
        const BackendClass = backendCodeResult['default'];
        setBackendClass(name, BackendClass);
        formatsDoc.submitObjectReplaceOp(p.concat('error'), null);
    }
    catch (e) {
        formatsDoc.submitObjectReplaceOp(p.concat('error'), `${e}`);
    }
    console.log('update backend code for ' + name);
}
function updateDisplayCode(index) {
    const data = formatsDoc.getData();
    const p = ['formats', index, 'displayCode'];
    const displayCode = data.formats[index].displayCode.code;
    const name = data.formats[index].name;
    try {
        const jsDisplayCode = displayCompiler.transpileTSXCode(displayCode);
        formatsDoc.submitObjectReplaceOp(p.concat('jsCode'), jsDisplayCode);
        formatsDoc.submitObjectReplaceOp(p.concat('error'), null);
    }
    catch (e) {
        formatsDoc.submitObjectReplaceOp(p.concat('error'), `${e}`);
    }
    console.log('update frontend code for ' + name);
}
formatsDoc.subscribe((type, ops) => {
    const data = formatsDoc.getData();
    if (data) {
        if (type === 'op') {
            const { formats } = data;
            ops.forEach((op) => {
                if (op.p.length === 2 && op.p[0] === 'formats' && lodash_1.has(op, 'li') && !lodash_1.has(op, 'ld')) { // new format added
                    const index = op.p[1];
                    updateDisplayCode(index);
                    updateBackendCode(index);
                }
                else if (op.p.length === 5 && op.p[3] === 'code' && (lodash_1.has(op, 'si') || lodash_1.has(op, 'sd'))) { //modified
                    const isBackend = op.p[2] === 'backendCode';
                    const index = op.p[1];
                    if (isBackend) {
                        updateBackendCode(index);
                    }
                    else {
                        updateDisplayCode(index);
                    }
                }
            });
        }
    }
});
// const displayCodeDoc:SDBDoc<DisplayCodeDoc> = sdbServer.get<DisplayCodeDoc>('example', 'display-code');
// const backendCodeDoc:SDBDoc<BackendCodeDoc> = sdbServer.get<BackendCodeDoc>('example', 'backend-code');
// const stateDoc:SDBDoc<StateDoc> = sdbServer.get<StateDoc>('example', 'state');
// stateDoc.createIfEmpty({
//     state: { x: '' }
// });
// displayCodeDoc.createIfEmpty({ code: `
// export default class WidgetDisplay {
//     public constructor(private displayBackend) {
//     };
//     public render():React.ReactNode {
//         const abc = this.displayBackend.getState('abc');
//         const greeting = 'hello';
//         return <div>{greeting} {abc}</div>;
//     };
// };
// `});
// backendCodeDoc.createIfEmpty({ code: `
// ` });
// displayCodeDoc.subscribe(throttle((type:string, ops) => {
//     const data = displayCodeDoc.getData();
//     if(data) {
//         if(type === "create" || (type === "op" && ops[0].p[0]==='code')) {
//             const {code} = data;
//             try {
//                 const jsCode = displayCompiler.transpileTSXCode(code);
//                 displayCodeDoc.submitObjectReplaceOp(['jsCode'], jsCode);
//                 console.log(jsCode);
//             } catch(e) {
//             }
//         }
//     }
// }, 1000));
// backendCodeDoc.subscribe(throttle(() => {
//     const data = backendCodeDoc.getData();
//     if(data) {
//         const {code} = data;
//         try {
//             const result = backendCompiler.runTSXCode(code);
//         } catch(e) {
//         }
//     }
// }, 1000));
// quillDoc.subscribe((ops:any[], source:any):void => { });
// setTimeout(() => {
//     const code = `
// import {InlineBlotBackend, InlineBlotInterface} from './InlineBlot';
// export default class WidgetBackend implements InlineBlotInterface {
//     private abc:number = 0;
//     public constructor(private backend:InlineBlotBackend) {
//     };
//     public onAdded():void {
//         this.interval = setInterval(() => {
//             this.abc++;
//             // console.log(this.abc);
//             this.backend.setState({
//                 abc: this.abc
//             });
//         }, 2000);
//     };
//     public onRemoved():void {
//         clearInterval(this.interval);
//     };
//     public onTextContentChanged():void {
//     };
// };
// `;
//     const BackendClass = backendCompiler.runTSXCode(code)['default'];
//     const backend = new InlineBlotBackend(stateDoc);
//     const backendInstance = new BackendClass(backend);
//     console.log(backendInstance.onAdded());
// }, 300);
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map