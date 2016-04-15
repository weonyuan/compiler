/*
    symbolTableService.ts

    Constructor for a symbol table.
*/

module COMPILER {
    export class SymbolTable {

        constructor(
            public entryList: Array<SymbolTableEntry> = new Array(26),
            public scopeNum: number = 0,
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

            var hashID: number = this.assignHashID(name);

            // Traverse through the entire symbol table for the entry
            while (currentScope !== null && !entryExists) {
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
                            _Errors++;
                            Main.addLog(LOG_ERROR, 'Identifier ' + name + ' on line ' + entry.getLineNum() +
                                ' was assigned before being declared.');
                        }
                    }
                }
            }

            return entryExists;
        }

        public addChild(child): void {
            this.childrenList.push(child);
        }

        public getEntry(entryNum): SymbolTableEntry {
            return this.entryList[entryNum];
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

        //TODO: provide warnings
    }
}