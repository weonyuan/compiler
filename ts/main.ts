///<reference path="globals.ts" />
/*
    main.ts

    Responsible for managing the user interface and
    calling the compiler.
*/

module COMPILER {
    export class Main {
        public static compile(): void {
            var sourceCode: string = (<HTMLTextAreaElement> document.getElementById('inputText')).value;
            Lexer.tokenize(sourceCode);
        }

        public static log(msg): void {
            console.log('log');

            //document.createElement('div')
        }
    }
}