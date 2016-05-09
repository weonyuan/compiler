/*
    symbolTableService.ts

    Constructor for a symbol table.
*/

module COMPILER {
    export class SymbolTable {

        constructor(
            public entryList: Array<SymbolTableEntry> = new Array(26),
            public scopeNum: number = -1,
            public parent: SymbolTable = null,
            public childrenList: Array<SymbolTableEntry> = new Array()) {

            for (var i = 0; i < 26; i++) {
                this.entryList[i] = null;
            }
        }

        public assignHashID(name): number {
            var hashID = name.charCodeAt(0);

            // 97 is the ASCII value for lowercase a
            var firstCharIndex = 97;
            hashID -= firstCharIndex;

            return hashID;
        }

        public insertEntry(name, type, lineNum): number {
            var symbolID: number = null;
            var entry: SymbolTableEntry = new SymbolTableEntry();
            entry.setName(name);
            entry.setType(type);
            entry.setLineNum(lineNum);
            entry.setScopeNum(this.scopeNum);

            var hashID: number = this.assignHashID(entry.getName());

            if (this.entryList[hashID] === null) {
                Main.addLog(LOG_VERBOSE, 'Inserting identifier ' + name + ' in line ' +
                    lineNum + ' to the symbol table under scope level ' + entry.getScopeNum() + '.');
                this.entryList[hashID] = entry;
                symbolID = entry.getID();
            }

            return symbolID;
        }

        public checkEntry(name, node, miscParam): boolean {
            var entryExists: boolean = false;
            var currentScope: SymbolTable = this;

            Main.addLog(LOG_VERBOSE, 'Checking if identifier ' + name + ' is stored in the symbol table.');

            // Traverse through the entire symbol table for the entry
            while (currentScope !== null && !entryExists) {
                var hashID: number = this.assignHashID(name);

                if (currentScope.entryList[hashID] === null) {
                    // Look at the parent scope for a possible entry
                    currentScope = currentScope.getParent();
                } else {
                    Main.addLog(LOG_VERBOSE, 'Identifier ' + name + ' in scope level ' +
                        currentScope.getScopeNum() + ' is in the symbol table.');

                    // Entry exists. Increment reference by 1
                    var entry: SymbolTableEntry = currentScope.entryList[hashID];
                    entry.incrementReference();
                    entryExists = true;

                    if (miscParam === 'Assignment Statement') {
                        entry.setInitialized();
                    }

                    if (node.parent.name !== 'Var Declaration' && miscParam !== 'Var Declaration') {
                        if (!entry.getInitialized()) {
                            _Warnings++;
                            Main.addLog(LOG_WARNING, 'Identifier ' + name + ' on line ' + entry.getLineNum() +
                                ' was assigned before being initialized.');
                        }
                    }

                    node.symbolEntry = entry;
                }
            }

            return entryExists;
        }

        public addChild(child): void {
            this.childrenList.push(child);
        }

        public getEntry(scope, hashID): SymbolTableEntry {
            var entry: SymbolTableEntry = null;

            // Traverse through the entire symbol table for the entry
            if (scope !== null) {
                if (scope.entryList[hashID] === null) {
                    // Look at the parent scope for a possible entry

                    for (var i = 0; i < scope.childrenList.length; i++) {
                        entry = this.getEntry(scope.childrenList[i], hashID);
                    }
                } else {
                    // Entry exists. Increment reference by 1
                    entry = scope.entryList[hashID];
                    entry.incrementReference();
                }
            }

            return entry;
        }

        public getSize(): number {
            return _Symbols;
        }

        public getScopeNum(): number {
            return this.scopeNum;
        }

        public getParent(): SymbolTable {
            return this.parent;
        }

        public getChildrenList(): Array<SymbolTableEntry> {
            return this.childrenList;
        }

        public setScopeNum(scopeNum): void {
            this.scopeNum = scopeNum;
        }

        public setParent(parent): void {
            this.parent = parent;
        }
    }
}