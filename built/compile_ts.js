"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const vm2_1 = require("vm2");
const lodash_1 = require("lodash");
const path = require("path");
const DEFAULT_NODE_VM_OPTIONS = {
    require: {
        external: true,
        root: './',
        builtin: ['react', 'react-dom']
    },
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
    runTSXCode(code, filename = path.join(__dirname, 'code.tsx')) {
        try {
            const script = new vm2_1.VMScript(TSXCompiler.convertTSXToJavaScript(code));
            const classDefinition = this.vm.run(script, filename);
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