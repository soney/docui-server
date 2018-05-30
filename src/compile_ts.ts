import * as ts from 'typescript';
import * as eval2 from 'eval2';
import {NodeVM, VMScript} from 'vm2';

const sandbox = {};
const vm = new NodeVM({
    require: {
        external: true,
        root: './',
        builtin: ['react', 'react-dom']
    },
    // compiler: tsCompiler,
    sandbox,
});

function tsCompiler(code:string, filename?:string):string {
    const transpileResult:ts.TranspileOutput = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false} });
    const {outputText, sourceMapText} = transpileResult;
    // const sourceMap = JSON.parse(sourceMapText);
    console.log(outputText);
    return outputText;
};

export function runTSCode(code:string):any {
    try {
        const script = new VMScript(tsCompiler(code));
        const classDefinition:any = vm.run(script, './code.tsx');
        console.log(classDefinition);
        return classDefinition;
    } catch(e) {
        console.error(e);
    }
};