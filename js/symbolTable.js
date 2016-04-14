/*
    symbolTableService.ts

    Constructor for a symbol table.
*/
var COMPILER;
(function (COMPILER) {
    var SymbolTable = (function () {
        function SymbolTable(entryList, scopeNum, parent, childrenList) {
            if (entryList === void 0) { entryList = new Array(26); }
            if (scopeNum === void 0) { scopeNum = 0; }
            if (parent === void 0) { parent = null; }
            if (childrenList === void 0) { childrenList = new Array(); }
            this.entryList = entryList;
            this.scopeNum = scopeNum;
            this.parent = parent;
            this.childrenList = childrenList;
            for (var i = 0; i < 26; i++) {
                this.entryList[i] = null;
            }
        }
        SymbolTable.prototype.assignHashID = function (name) {
            var hashID = name.charCodeAt(0);
            // 97 is the ASCII value for lowercase a
            var firstCharIndex = 97;
            hashID -= firstCharIndex;
            return hashID;
        };
        SymbolTable.prototype.insertEntry = function (name, type, lineNum) {
            var symbolID = -1;
            var entry = new COMPILER.SymbolTableEntry();
            entry.setName(name);
            entry.setType(type);
            entry.setLineNum(lineNum);
            entry.setScopeNum(this.scopeNum);
            var hashID = this.assignHashID(entry.getName());
            if (this.entryList[hashID] === null) {
                this.entryList[hashID] = entry;
            }
            symbolID = entry.getID();
            return symbolID;
        };
        SymbolTable.prototype.addChild = function (child) {
            this.childrenList.push(child);
        };
        SymbolTable.prototype.getEntry = function (entryNum) {
            return this.entryList[entryNum];
        };
        SymbolTable.prototype.getSize = function () {
            return _Symbols;
        };
        SymbolTable.prototype.getScopeNum = function () {
            return this.scopeNum;
        };
        SymbolTable.prototype.getParent = function () {
            return this.parent;
        };
        SymbolTable.prototype.getChildrenList = function () {
            return this.childrenList;
        };
        SymbolTable.prototype.setScopeNum = function (scopeNum) {
            this.scopeNum = scopeNum;
        };
        SymbolTable.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        return SymbolTable;
    })();
    COMPILER.SymbolTable = SymbolTable;
})(COMPILER || (COMPILER = {}));
