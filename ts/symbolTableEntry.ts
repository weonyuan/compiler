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
            public type: string = '',
            public lineNum: number = 0,
            public scopeNum: number = 0,
            public timesReferred: number = 0,
            public initialized: boolean = false) {}

        public getID(): number {
            return this.id;
        }

        public getName(): string {
            return this.name;
        }

        public getType(): string {
            return this.type;
        }

        public getLineNum(): number {
            return this.lineNum;
        }

        public getScopeNum(): number {
            return this.scopeNum;
        }

        public getTimesReferred(): number {
            return this.timesReferred;
        }

        public getInitialized(): boolean {
            return this.initialized;
        }

        public setName(name): void {
            this.name = name;
        }

        public setType(type): void {
            this.type = type;
        }

        public setLineNum(lineNum): void {
            this.lineNum = lineNum;
        }

        public setScopeNum(scopeNum): void {
            this.scopeNum = scopeNum;
        }

        public incrementReference(): void {
            this.timesReferred++;
        }

        public setInitialized(): void {
            this.initialized = true;
        }
    }
}