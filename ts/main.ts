/*
    main.ts

    Responsible for managing the user interface and
    calling the compiler.
*/

module Compiler {
    export class Main {
        public compile(): void {
            Lexer.tokenize();
        }
    }
}