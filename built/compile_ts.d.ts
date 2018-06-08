import { NodeVMOptions } from 'vm2';
export declare class TSXCompiler {
    private sandbox;
    private vm;
    constructor(vmOptions?: NodeVMOptions);
    private static convertTSXToJavaScript(code);
    transpileTSXCode(code: string): string;
    runTSXCode(code: string, filename?: string): any;
}
