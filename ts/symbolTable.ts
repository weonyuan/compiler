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
            var symbolID: number = -1;
            var entry: SymbolTableEntry = new SymbolTableEntry();
            entry.setName(name);
            entry.setType(type);
            entry.setLineNum(lineNum);
            entry.setScopeNum(this.scopeNum);

            var hashID: number = this.assignHashID(entry.getName());

            if (this.entryList[hashID] === null) {
                this.entryList[hashID] = entry;
            }

            symbolID = entry.getID();

            return symbolID;
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