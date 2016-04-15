///<reference path="globals.ts" />
/*
    symbolTableEntry.ts

    Constructor for a symbol table entry.
*/
var COMPILER;
(function (COMPILER) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry(id, name, type, lineNum, scopeNum, timesReferred, initialized) {
            if (id === void 0) { id = _Symbols++; }
            if (name === void 0) { name = ''; }
            if (type === void 0) { type = ''; }
            if (lineNum === void 0) { lineNum = 0; }
            if (scopeNum === void 0) { scopeNum = 0; }
            if (timesReferred === void 0) { timesReferred = 0; }
            if (initialized === void 0) { initialized = false; }
            this.id = id;
            this.name = name;
            this.type = type;
            this.lineNum = lineNum;
            this.scopeNum = scopeNum;
            this.timesReferred = timesReferred;
            this.initialized = initialized;
        }
        SymbolTableEntry.prototype.getID = function () {
            return this.id;
        };
        SymbolTableEntry.prototype.getName = function () {
            return this.name;
        };
        SymbolTableEntry.prototype.getType = function () {
            return this.type;
        };
        SymbolTableEntry.prototype.getLineNum = function () {
            return this.lineNum;
        };
        SymbolTableEntry.prototype.getScopeNum = function () {
            return this.scopeNum;
        };
        SymbolTableEntry.prototype.getTimesReferred = function () {
            return this.timesReferred;
        };
        SymbolTableEntry.prototype.getInitialized = function () {
            return this.initialized;
        };
        SymbolTableEntry.prototype.setName = function (name) {
            this.name = name;
        };
        SymbolTableEntry.prototype.setType = function (type) {
            this.type = type;
        };
        SymbolTableEntry.prototype.setLineNum = function (lineNum) {
            this.lineNum = lineNum;
        };
        SymbolTableEntry.prototype.setScopeNum = function (scopeNum) {
            this.scopeNum = scopeNum;
        };
        SymbolTableEntry.prototype.incrementReference = function () {
            this.timesReferred++;
        };
        SymbolTableEntry.prototype.setInitialized = function () {
            this.initialized = true;
        };
        return SymbolTableEntry;
    })();
    COMPILER.SymbolTableEntry = SymbolTableEntry;
})(COMPILER || (COMPILER = {}));
