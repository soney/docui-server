import { NodeVMOptions } from 'vm2';
export declare class TSXCompiler {
    private sandbox;
    private vm;
    constructor(vmOptions?: NodeVMOptions);
    private static convertTSXToJavaScript(code);
    runTSXCode(code: string, filename?: string): any;
}
