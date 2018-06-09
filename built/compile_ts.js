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
const DEFAULT_TRANSPILE_OPTIONS = {
    jsx: ts.JsxEmit.React,
    sourceMap: false
};
class TSXCompiler {
    constructor(vmOptions = {}, transpileOptions = {}) {
        this.transpileOptions = transpileOptions;
        this.vm = new vm2_1.NodeVM(lodash_1.merge({}, DEFAULT_NODE_VM_OPTIONS, vmOptions));
    }
    ;
    transpileTSXCode(code) {
        const transpileResult = ts.transpileModule(code, { compilerOptions: lodash_1.merge({}, DEFAULT_TRANSPILE_OPTIONS, this.transpileOptions) });
        const { outputText, sourceMapText } = transpileResult;
        // const sourceMap = JSON.parse(sourceMapText);
        return outputText;
    }
    ;
    runTSXCode(code, filename = path.join(__dirname, 'code.tsx')) {
        const jsCode = new vm2_1.VMScript(this.transpileTSXCode(code));
        const classDefinition = this.vm.run(jsCode, filename);
        return classDefinition;
    }
    ;
}
exports.TSXCompiler = TSXCompiler;
;
//# sourceMappingURL=compile_ts.js.map