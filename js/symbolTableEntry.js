///<reference path="globals.ts" />
/*
    symbolTableEntry.ts

    Constructor for a symbol table entry.
*/
var COMPILER;
(function (COMPILER) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry(id, name, lineNum, scopeNum) {
            if (id === void 0) { id = _Symbols++; }
            if (name === void 0) { name = ''; }
            if (lineNum === void 0) { lineNum = 0; }
            if (scopeNum === void 0) { scopeNum = 0; }
            this.id = id;
            this.name = name;
            this.lineNum = lineNum;
            this.scopeNum = scopeNum;
        }
        SymbolTableEntry.prototype.getId = function () {
            return this.id;
        };
        SymbolTableEntry.prototype.getName = function () {
            return this.name;
        };
        SymbolTableEntry.prototype.getLineNum = function () {
            return this.lineNum;
        };
        SymbolTableEntry.prototype.getScopeNum = function () {
            return this.scopeNum;
        };
        SymbolTableEntry.prototype.setId = function (id) {
            this.id = id;
        };
        SymbolTableEntry.prototype.setName = function (name) {
            this.name = name;
        };
        SymbolTableEntry.prototype.setLineNum = function (lineNum) {
            this.lineNum = lineNum;
        };
        SymbolTableEntry.prototype.setScopeNum = function (scopeNum) {
            this.scopeNum = scopeNum;
        };
        return SymbolTableEntry;
    })();
    COMPILER.SymbolTableEntry = SymbolTableEntry;
})(COMPILER || (COMPILER = {}));
