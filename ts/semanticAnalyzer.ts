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

            this.printResults();
        }

        public static generateAST(): void {

        }

        public static typeCheck(): void {

        }

        public static scopeCheck(): void {

        }

        public static printResults(): void {
            Main.addLog(LOG_INFO, 'Parsing complete. Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _AST.printTreeString('ast');

            // Reset the warnings and errors for the next process
            _Warnings = 0;
            _Errors = 0;
        }
    }
}