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
const displayCompiler = new compile_ts_1.TSXCompiler({
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
` });
backendCodeDoc.createIfEmpty({ code: `
` });
quillDoc.createIfEmpty([{ insert: `
XXXXXXXXXXXX XXXXXXXXXXXXX
YYYYYYYYYYYY YYYYYYYYYYYYY
ZZZZZZZZZZZZ ZZZZZZZZZZZZZ
` }], 'rich-text');
displayCodeDoc.subscribe(lodash_1.throttle((type, ops) => {
    const data = displayCodeDoc.getData();
    if (data) {
        if (type === "create" || (type === "op" && ops[0].p[0] === 'code')) {
            const { code } = data;
            try {
                const jsCode = displayCompiler.transpileTSXCode(code);
                displayCodeDoc.submitObjectReplaceOp(['jsCode'], jsCode);
                console.log(jsCode);
            }
            catch (e) {
            }
        }
    }
}, 1000));
backendCodeDoc.subscribe(lodash_1.throttle(() => {
    const data = backendCodeDoc.getData();
    if (data) {
        const { code } = data;
        try {
            const result = backendCompiler.runTSXCode(code);
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
    const backend = new InlineBlot_1.InlineBlotBackend(stateDoc);
    const backendInstance = new BackendClass(backend);
    console.log(backendInstance.onAdded());
}, 300);
server.listen(PORT);
console.log(`Listening on port ${PORT}`);
//# sourceMappingURL=index.js.map