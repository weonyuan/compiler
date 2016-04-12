///<reference path="globals.ts" />
/*
    symbolTableEntry.ts

    Constructor for a symbol table entry.
*/

module COMPILER {
    export class SymbolTableEntry {
        constructor(
            public id: number = _Symbols++,
            public name: string = '',
            public lineNum: number = 0,
            public scopeNum: number = 0) {}

        public getId(): number {
            return this.id;
        }

        public getName(): string {
            return this.name;
        }

        public getLineNum(): number {
            return this.lineNum;
        }

        public getScopeNum(): number {
            return this.scopeNum;
        }

        public setId(id): void {
            this.id = id;
        }

        public setName(name): void {
            this.name = name;
        }

        public setLineNum(lineNum): void {
            this.lineNum = lineNum;
        }

        public setScopeNum(scopeNum): void {
            this.scopeNum = scopeNum;
        }
    }
}