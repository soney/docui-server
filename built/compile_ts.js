"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const vm2_1 = require("vm2");
const sandbox = {};
const vm = new vm2_1.NodeVM({
    require: {
        external: true,
        root: './',
        builtin: ['react', 'react-dom']
    },
    // compiler: tsCompiler,
    sandbox,
});
function tsCompiler(code, filename) {
    const transpileResult = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false } });
    const { outputText, sourceMapText } = transpileResult;
    // const sourceMap = JSON.parse(sourceMapText);
    console.log(outputText);
    return outputText;
}
;
function runTSCode(code) {
    try {
        const script = new vm2_1.VMScript(tsCompiler(code));
        const classDefinition = vm.run(script, './code.tsx');
        console.log(classDefinition);
        return classDefinition;
    }
    catch (e) {
        console.error(e);
    }
}
exports.runTSCode = runTSCode;
;
//# sourceMappingURL=compile_ts.js.map