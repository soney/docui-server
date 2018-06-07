import * as ts from 'typescript';
import * as eval2 from 'eval2';
// import {NodeVM, VMScript, NodeVMOptions} from 'vm2';
import * as vm from 'vm';
import {merge} from 'lodash';
import * as path from 'path';

const DEFAULT_NODE_VM_OPTIONS = {
    sandbox: {}
};

export class TSXCompiler {
    private sandbox:{[key:string]:any};
    private vm:vm.Context;

    public constructor(vmOptions:any={}) {
        this.vm = vm.createContext(merge({}, DEFAULT_NODE_VM_OPTIONS, vmOptions));
    };

    private static convertTSXToJavaScript(code:string):string {
        const transpileResult:ts.TranspileOutput = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false} });
        const {outputText, sourceMapText} = transpileResult;
        // const sourceMap = JSON.parse(sourceMapText);
        return outputText;
    };

    public runTSXCode(code:string, filename:string=path.join(__dirname, 'code.tsx')):any {
        try {
            const jsCode = TSXCompiler.convertTSXToJavaScript(code);
            const classDefinition:any = vm.runInContext(jsCode, this.vm);
            return classDefinition;
        } catch(e) {
            console.error(e);
        }
    };
};