import * as ts from 'typescript';
import * as eval2 from 'eval2';
import {NodeVM, VMScript, NodeVMOptions} from 'vm2';
import {merge} from 'lodash';

const DEFAULT_NODE_VM_OPTIONS = {
    require: {
        external: true,
        root: './',
        builtin: ['react', 'react-dom']
    },
    sandbox: {}
};

export class TSXCompiler {
    private sandbox:{[key:string]:any};
    private vm:NodeVM;

    public constructor(vmOptions:NodeVMOptions={}) {
        this.vm = new NodeVM(merge({}, DEFAULT_NODE_VM_OPTIONS, vmOptions));
    };

    private static convertTSXToJavaScript(code:string):string {
        const transpileResult:ts.TranspileOutput = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React, sourceMap: false} });
        const {outputText, sourceMapText} = transpileResult;
        // const sourceMap = JSON.parse(sourceMapText);
        return outputText;
    };

    private runTSXCode(code:string, filename:string='./code.tsx'):any {
        try {
            const script = new VMScript(TSXCompiler.convertTSXToJavaScript(code));
            const classDefinition:any = this.vm.run(script, filename);
            return classDefinition;
        } catch(e) {
            console.error(e);
        }
    };
};