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
        };
        SemanticAnalyzer.generateAST = function () {
        };
        SemanticAnalyzer.typeCheck = function () {
        };
        SemanticAnalyzer.scopeCheck = function () {
        };
        return SemanticAnalyzer;
    })();
    COMPILER.SemanticAnalyzer = SemanticAnalyzer;
})(COMPILER || (COMPILER = {}));
