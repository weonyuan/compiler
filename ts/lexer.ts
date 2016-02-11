///<reference path="globals.ts" />
/*
    lexer.ts

    Responsible for tokenizing the input code and storing
    the tokens in a list.
*/

module COMPILER {
    export class Lexer {
        public static tokenize(input): void {
            console.log('performing tokenize()');

            var tokens = [];
            var buffer: string = '';

            var tokenPattern = [
                { type: T_LBRACE, regex: /^\{$/ },
                { type: T_RBRACE, regex: /^\}$/ },
                { type: T_LPAREN, regex: /^\($/ },
                { type: T_RPAREN, regex: /^\)$/ },
                { type: T_QUOTE, regex: /^\"$/ },
                { type: T_ADD, regex: /^\+$/ },
                { type: T_EXCLAMATION, regex: /^\!$/ },
                { type: T_ASSIGN, regex: /^\=$/ },
                { type: T_WHITESPACE, regex: /^\s$/ },
                { type: T_EOF, regex: /^\$$/ },
                { type: T_EQUAL, regex: /^\=\=$/ },
                { type: T_NOTEQUAL, regex: /^\!\=$/ },
                { type: T_INT, regex: /^int$/ },
                { type: T_STRING, regex: /^string$/ },
                { type: T_BOOLEAN, regex: /^boolean$/ }
            ];

            for (var i = 0; i < input.length; i++) {
                var currentChar: string = input.charAt(i);
                var isMatched: boolean = false;

                for (var j = 0; j < tokenPattern.length; j++) {
                    if (currentChar.match(tokenPattern[j].regex)) {
                        console.log('matched!');
                        break;
                    } else {
                    }
                }
            }
        } 
    }
}