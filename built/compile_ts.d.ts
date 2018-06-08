import * as ts from 'typescript';
import { NodeVMOptions } from 'vm2';
export declare class TSXCompiler {
    private transpileOptions;
    private sandbox;
    private vm;
    constructor(vmOptions?: NodeVMOptions, transpileOptions?: ts.CompilerOptions);
    transpileTSXCode(code: string): string;
    runTSXCode(code: string, filename?: string): any;
}
