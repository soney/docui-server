import * as ts from 'typescript';
import * as eval2 from 'eval2';
import {NodeVM, VMScript} from 'vm2';

const sandbox = {};
const vm = new NodeVM({
    require: {
        external: true
    },
    compiler: tsCompiler,
    sandbox,
});

function tsCompiler(code:string, filename:string):string {
    const transpileResult:ts.TranspileOutput = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false} });
    const {outputText, sourceMapText} = transpileResult;
    const sourceMap = JSON.parse(sourceMapText);
    return outputText;
};

export function runTSCode(code:string):any {
    try {
        const script = new VMScript(code);
        const result:any = vm.run(script);
        console.log(result);
        return result;
    } catch(e) {
        console.error(e);
    }
};