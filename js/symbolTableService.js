///<reference path="symbolTableEntry.ts" />
///<reference path="globals.ts" />
/*
    symbolTableService.ts

    Responsible for interacting with Symbol Table instances.
*/
var COMPILER;
(function (COMPILER) {
    var SymbolTableService = (function () {
        function SymbolTableService() {
        }
        SymbolTableService.init = function () {
            var symbolTable = [];
            return symbolTable;
        };
        return SymbolTableService;
    })();
    COMPILER.SymbolTableService = SymbolTableService;
})(COMPILER || (COMPILER = {}));
