///<reference path="globals.ts" />
/*
  token.ts

  Constructor for a token.
*/

module COMPILER {
    export class Token {
        constructor(
            public type: number = 0,
            public lineNum: number = 0
        ) {}

        public static getType(): number {
          return this.type;
        }

        public static getLineNum(): number {
            return this.lineNum;
        }
    }
}