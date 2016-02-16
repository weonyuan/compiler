///<reference path="globals.ts" />
/*
  token.ts

  Constructor for a token.
*/

module COMPILER {
    export class Token {
        constructor(
            public name: string = '',
            public type: number = 0,
            public value: string = '',
            public lineNum: number = 0
        ) {}

        public getName(): string {
            return this.name;
        }

        public getType(): number {
            return this.type;
        }

        public getValue(): string {
            return this.value;
        }

        public getLineNum(): number {
            return this.lineNum;
        }

        public setName(name): void {
            this.name = name;
        }

        public setType(type): void {
            this.type = type;
        }

        public setValue(value): void {
            this.value = value;
        }

        public setLineNum(lineNum): void {
            this.lineNum = lineNum;
        }
    }
}