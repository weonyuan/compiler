///<reference path="globals.ts" />
/*
    lexer.ts

    Responsible for tokenizing the input code and storing
    the tokens in a list.
*/
var COMPILER;
(function (COMPILER) {
    var Lexer = (function () {
        function Lexer() {
        }
        Lexer.tokenize = function (input) {
            COMPILER.Main.resetLog();
            var log = {
                status: null,
                msg: null
            };
            log.status = LOG_INFO;
            log.msg = 'Performing input tokenization through lexer.';
            COMPILER.Main.addLog(log);
            var tokens = [];
            var buffer = '';
            var tokenPattern = [
                { name: 'T_LBRACE', type: T_LBRACE, regex: /^\{$/ },
                { name: 'T_RBRACE', type: T_RBRACE, regex: /^\}$/ },
                { name: 'T_LPAREN', type: T_LPAREN, regex: /^\($/ },
                { name: 'T_RPAREN', type: T_RPAREN, regex: /^\)$/ },
                { name: 'T_QUOTE', type: T_QUOTE, regex: /^\"$/ },
                { name: 'T_ADD', type: T_ADD, regex: /^\+$/ },
                { name: 'T_EXCLAMATION', type: T_EXCLAMATION, regex: /^\!$/ },
                { name: 'T_ASSIGN', type: T_ASSIGN, regex: /^\=$/ },
                { name: 'T_WHITESPACE', type: T_WHITESPACE, regex: /^\s$/ },
                { name: 'T_EOF', type: T_EOF, regex: /^\$$/ },
                { name: 'T_EQUAL', type: T_EQUAL, regex: /^\=\=$/ },
                { name: 'T_NOTEQUAL', type: T_NOTEQUAL, regex: /^\!\=$/ },
                { name: 'T_INT', type: T_INT, regex: /^int$/ },
                { name: 'T_STRING', type: T_STRING, regex: /^string$/ },
                { name: 'T_BOOLEAN', type: T_BOOLEAN, regex: /^boolean$/ }
            ];
            if (input.length > 0) {
                for (var i = 0; i < input.length; i++) {
                    var currentChar = input.charAt(i);
                    // var isMatched: boolean = false;
                    for (var j = 0; j < tokenPattern.length; j++) {
                        if (currentChar.match(tokenPattern[j].regex)) {
                            console.log('matched!');
                            break;
                        }
                    }
                }
                log.status = LOG_SUCCESS;
                log.msg = 'Lexer found 0 error(s) and 0 warning(s).';
            }
            else {
                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }
            COMPILER.Main.addLog(log);
        };
        return Lexer;
    })();
    COMPILER.Lexer = Lexer;
})(COMPILER || (COMPILER = {}));
