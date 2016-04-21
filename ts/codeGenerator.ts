///<reference path="globals.ts" />
/*
    codeGenerator.ts

    Responsible for generator 6502a op codes from the AST.
*/

module COMPILER {
    export class CodeGenerator {
        public static codeTable: string[] = null;
        public static staticTable: any[] = null;
        public static jumpTable: any[] = null;

        public static build(): void {
            Main.addLog(LOG_INFO, 'Performing 6502a code generation.');

            this.codeTable = [];

            for (var i = 0; i < PROGRAM_SIZE; i++) {
                this.codeTable[i] = '00';
            }

            this.staticTable = [];
            this.jumpTable = [];
        }
    }
}