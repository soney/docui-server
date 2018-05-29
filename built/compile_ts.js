"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const vm2_1 = require("vm2");
const sandbox = {};
const vm = new vm2_1.NodeVM({
    require: {
        external: true
    },
    compiler: tsCompiler,
    sandbox,
});
function tsCompiler(code, filename) {
    const transpileResult = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false } });
    const { outputText, sourceMapText } = transpileResult;
    const sourceMap = JSON.parse(sourceMapText);
    return outputText;
}
;
function runTSCode(code) {
    try {
        const script = new vm2_1.VMScript(code);
        const result = vm.run(script);
        console.log(result);
        return result;
    }
    catch (e) {
        console.error(e);
    }
}
exports.runTSCode = runTSCode;
;
//# sourceMappingURL=compile_ts.js.map