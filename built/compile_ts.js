"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const vm2_1 = require("vm2");
// import * as vm from 'vm';
const lodash_1 = require("lodash");
const path = require("path");
const DEFAULT_NODE_VM_OPTIONS = {
    sandbox: {}
};
class TSXCompiler {
    constructor(vmOptions = {}) {
        this.vm = new vm2_1.NodeVM(lodash_1.merge({}, DEFAULT_NODE_VM_OPTIONS, vmOptions));
    }
    ;
    static convertTSXToJavaScript(code) {
        const transpileResult = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false } });
        const { outputText, sourceMapText } = transpileResult;
        // const sourceMap = JSON.parse(sourceMapText);
        return outputText;
    }
    ;
    transpileTSXCode(code) {
        return TSXCompiler.convertTSXToJavaScript(code);
    }
    ;
    runTSXCode(code, filename = path.join(__dirname, 'code.tsx')) {
        try {
            const jsCode = new vm2_1.VMScript(this.transpileTSXCode(code));
            const classDefinition = this.vm.run(jsCode, filename);
            return classDefinition;
        }
        catch (e) {
            console.error(e);
        }
    }
    ;
}
exports.TSXCompiler = TSXCompiler;
;
//# sourceMappingURL=compile_ts.js.map