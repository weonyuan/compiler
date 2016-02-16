///<reference path="token.ts" />

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

            if (input.length > 0) {
                for (var i = 0; i < input.length; i++) {
                    var currentChar: string = input.charAt(i);
                    buffer += currentChar;
                    // var isMatched: boolean = false;

                    for (var tokenName in tokenPattern) {
                        // If there is a match, create a new token and push it
                        // to the token table
                        if (buffer.match(tokenPattern[tokenName].regex)
                            && tokenPattern[tokenName].type !== T_WHITESPACE) {
                            var token = new Token();
                            token.setName(tokenName);
                            token.setType(tokenPattern[tokenName].type);
                            token.setValue(buffer);

                            tokens.push(token);

                            // Reset the buffer to look for another token
                            buffer = '';
                            break;
                        }
                    }
                }

                if (tokens.length === 0) {
                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                } else if (input.charAt(input.length - 1) !== '$') {
                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing. Appending EOF char to input.';

                    var token = new Token();
                    token.setName('T_EOF');
                    token.setType(T_EOF);
                    token.setValue('$');

                    tokens.push(token);
                } else {
                    log.status = LOG_SUCCESS;
                    log.msg = 'Lexer found 0 error(s) and 0 warning(s).';
                }
            } else {
                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }

            Main.updateTokenTable(tokens);
            Main.addLog(log);
        } 
    }
}