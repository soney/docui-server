import * as ts from 'typescript';
import * as eval2 from 'eval2';
import {NodeVM, VMScript, NodeVMOptions} from 'vm2';
// import * as vm from 'vm';
import {merge} from 'lodash';
import * as path from 'path';

const DEFAULT_NODE_VM_OPTIONS:NodeVMOptions = {
    sandbox: {}
};
const DEFAULT_TRANSPILE_OPTIONS:ts.CompilerOptions = {
    jsx: ts.JsxEmit.React,
    sourceMap: false
};

export class TSXCompiler {
    private sandbox:{[key:string]:any};
    // private vm:vm.Context;
    private vm:NodeVM;

    public constructor(vmOptions:NodeVMOptions={}, private transpileOptions:ts.CompilerOptions={}) {
        this.vm = new NodeVM(merge({}, DEFAULT_NODE_VM_OPTIONS, vmOptions));
    };

    public transpileTSXCode(code:string):string {
        const transpileResult:ts.TranspileOutput = ts.transpileModule(code, { compilerOptions:  merge({}, DEFAULT_TRANSPILE_OPTIONS, this.transpileOptions)});
        const {outputText, sourceMapText} = transpileResult;
        // const sourceMap = JSON.parse(sourceMapText);
        return outputText;
    };

    public runTSXCode(code:string, filename:string=path.join(__dirname, 'code.tsx')):any {
        const jsCode = new VMScript(this.transpileTSXCode(code));
        const classDefinition:any = this.vm.run(jsCode, filename);
        return classDefinition;
    };
};