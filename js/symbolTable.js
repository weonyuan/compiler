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
            var symbolID = null;
            var entry = new COMPILER.SymbolTableEntry();
            entry.setName(name);
            entry.setType(type);
            entry.setLineNum(lineNum);
            entry.setScopeNum(this.scopeNum);
            var hashID = this.assignHashID(entry.getName());
            if (this.entryList[hashID] === null) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Inserting identifier ' + name + ' in line ' +
                    lineNum + ' to the symbol table under scope level ' + entry.getScopeNum() + '.');
                this.entryList[hashID] = entry;
                symbolID = entry.getID();
            }
            return symbolID;
        };
        SymbolTable.prototype.checkEntry = function (name, node, miscParam) {
            var entryExists = false;
            var currentScope = this;
            COMPILER.Main.addLog(LOG_VERBOSE, 'Checking if identifier ' + name + ' is stored in the symbol table.');
            var hashID = this.assignHashID(name);
            // Traverse through the entire symbol table for the entry
            while (currentScope !== null && !entryExists) {
                if (currentScope.entryList[hashID] === null) {
                    // Look at the parent scope for a possible entry
                    currentScope = currentScope.getParent();
                }
                else {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Identifier ' + name + ' in scope level ' +
                        currentScope.getScopeNum() + ' is in the symbol table.');
                    // Entry exists. Increment reference by 1
                    var entry = currentScope.entryList[hashID];
                    entry.incrementReference();
                    entryExists = true;
                    if (miscParam === 'Assignment Statement') {
                        entry.setInitialized();
                    }
                    if (node.parent.name !== 'Var Declaration' && miscParam !== 'Var Declaration') {
                        if (!entry.getInitialized()) {
                            _Errors++;
                            COMPILER.Main.addLog(LOG_ERROR, 'Identifier ' + name + ' on line ' + entry.getLineNum() +
                                ' was assigned before being declared.');
                        }
                    }
                }
            }
            return entryExists;
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
