///<reference path="tree.ts" />
///<reference path="symbolTableService.ts" />
///<reference path="globals.ts" />
/*
    semanticAnalyzer.ts

    Responsible for checking the scope and type
    of the CST.
*/
var COMPILER;
(function (COMPILER) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        SemanticAnalyzer.init = function (symbolTable) {
            COMPILER.Main.addLog(LOG_INFO, 'Performing semantic analysis.');
            _SymbolTable = COMPILER.SymbolTableService.init();
            this.generateAST();
            this.typeCheck();
            this.scopeCheck();
            this.printResults();
        };
        SemanticAnalyzer.generateAST = function () {
        };
        SemanticAnalyzer.typeCheck = function () {
        };
        SemanticAnalyzer.scopeCheck = function () {
        };
        SemanticAnalyzer.printResults = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Parsing complete. Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _AST.printTreeString('ast');
            // Reset the warnings and errors for the next process
            _Warnings = 0;
            _Errors = 0;
        };
        return SemanticAnalyzer;
    })();
    COMPILER.SemanticAnalyzer = SemanticAnalyzer;
})(COMPILER || (COMPILER = {}));
