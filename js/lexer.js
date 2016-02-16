///<reference path="token.ts" />
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
            if (input.length > 0) {
                for (var i = 0; i < input.length; i++) {
                    var currentChar = input.charAt(i);
                    // var isMatched: boolean = false;
                    for (var tokenName in tokenPattern) {
                        if (currentChar.match(tokenPattern[tokenName].regex)
                            && tokenPattern[tokenName].type !== T_WHITESPACE) {
                            var token = new COMPILER.Token();
                            token.setName(tokenName);
                            token.setType(tokenPattern[tokenName].type);
                            token.setValue(currentChar);
                            tokens.push(token);
                            break;
                        }
                    }
                }
                if (tokens.length === 0) {
                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                }
                else if (input.charAt(input.length - 1) !== '$') {
                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing.';
                }
                else {
                    log.status = LOG_SUCCESS;
                    log.msg = 'Lexer found 0 error(s) and 0 warning(s).';
                }
            }
            else {
                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }
            COMPILER.Main.updateTokenTable(tokens);
            COMPILER.Main.addLog(log);
        };
        return Lexer;
    })();
    COMPILER.Lexer = Lexer;
})(COMPILER || (COMPILER = {}));
