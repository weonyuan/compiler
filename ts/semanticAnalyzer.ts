///<reference path="tree.ts" />
///<reference path="symbolTableService.ts" />
///<reference path="globals.ts" />
/*
    semanticAnalyzer.ts

    Responsible for checking the scope and type
    of the CST.
*/

module COMPILER {
    export class SemanticAnalyzer {
        public static init(symbolTable): void {
            Main.addLog(LOG_INFO, 'Performing semantic analysis.');

            _SymbolTable = SymbolTableService.init();

            this.generateAST();
            this.typeCheck();
            this.scopeCheck();
        }

        public static generateAST(): void {

        }

        public static typeCheck(): void {

        }

        public static scopeCheck(): void {

        }
    }
}