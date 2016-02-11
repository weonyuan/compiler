///<reference path="globals.ts" />
/*
    lexer.ts

    Responsible for tokenizing the input code and storing
    the tokens in a list.
*/

module COMPILER {
    export class Lexer {
        public static tokenize(input): void {
            Main.resetLog();

            var log = {
                status: null,
                msg: null
            }

            log.status = LOG_INFO;
            log.msg = 'Performing input tokenization through lexer.';
            Main.addLog(log);

            var tokens = [];
            var buffer: string = '';

            var tokenPattern = [
                // Reserved keywords
                { name: 'T_PRINT', type: T_PRINT, regex: /^print$/ },
                { name: 'T_WHILE', type: T_WHILE, regex: /^while$/ },
                { name: 'T_IF', type: T_IF, regex: /^if$/ },
                { name: 'T_INT', type: T_INT, regex: /^int$/ },
                { name: 'T_STRING', type: T_STRING, regex: /^string$/ },
                { name: 'T_BOOLEAN', type: T_BOOLEAN, regex: /^boolean$/ },
                { name: 'T_TRUE', type: T_TRUE, regex: /^true$/ },
                { name: 'T_FALSE', type: T_FALSE, regex: /^false$/ },
                // Identifiers
                { name: 'T_ID', type: T_ID, regex: /^[a-z]$/ },
                // Misc (symbols and characters)
                { name: 'T_EQUAL', type: T_EQUAL, regex: /^\=\=$/ },
                { name: 'T_NOTEQUAL', type: T_NOTEQUAL, regex: /^\!\=$/ },
                { name: 'T_LBRACE', type: T_LBRACE, regex: /^\{$/ },
                { name: 'T_RBRACE', type: T_RBRACE, regex: /^\}$/ },
                { name: 'T_LPAREN', type: T_LPAREN, regex: /^\($/ },
                { name: 'T_RPAREN', type: T_RPAREN, regex: /^\)$/ },
                { name: 'T_QUOTE', type: T_QUOTE, regex: /^\"$/ },
                { name: 'T_DIGIT', type: T_DIGIT, regex: /^[0-9]$/ },
                { name: 'T_CHAR', type: T_CHAR, regex: /^[a-z]$/ },
                { name: 'T_QUOTE', type: T_QUOTE, regex: /^\"$/ },
                { name: 'T_ADD', type: T_ADD, regex: /^\+$/ },
                { name: 'T_EXCLAMATION', type: T_EXCLAMATION, regex: /^\!$/ },
                { name: 'T_ASSIGN', type: T_ASSIGN, regex: /^\=$/ },
                { name: 'T_WHITESPACE', type: T_WHITESPACE, regex: /^\s$/ },
                { name: 'T_EOF', type: T_EOF, regex: /^\$$/ }
            ];

            if (input.length > 0) {
                for (var i = 0; i < input.length; i++) {
                    var currentChar: string = input.charAt(i);
                    // var isMatched: boolean = false;
                    for (var j = 0; j < tokenPattern.length; j++) {
                        if (currentChar.match(tokenPattern[j].regex)
                            && tokenPattern[j].type !== T_WHITESPACE) {
                            tokens.push(tokenPattern[j]);
                            break;
                        }
                    }
                }

                if (tokens.length === 0) {
                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                } else if (input.charAt(input.length - 1) !== '$') {
                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing.';
                } else {
                    log.status = LOG_SUCCESS;
                    log.msg = 'Lexer found 0 error(s) and 0 warning(s).';
                }
            } else {
                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }

            Main.addLog(log);
        } 
    }
}