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
            var codeChunks = this.splitCodeBySpace(input);
            var eofExists = false;
            /*
                x 1. Take the input string
                x 2. Read the string character by character
                x 3. As you read a new character, build the buffer
                4. Keep building until you've reached a null/undefined/T_WHITESPSACE
                5. Take the buffer and put it into a pattern match
                6. It should match the longest token before comparing the buffer to shorter tokens
                7. If matched, create a new token from the pattern and push it into token table
            */
            if (input.length > 0) {
                var currentIndex = 0;
                var numErrors = 0;
                var numWarnings = 0;
                while (currentIndex < codeChunks.length && !eofExists) {
                    // Scan through the chunks
                    var currentChunk = codeChunks[currentIndex++];
                    var buffer = '';
                    console.log(currentChunk);
                    // Match the chunk with a token pattern
                    for (var tokenName in tokenPattern) {
                        var isMatched = false;
                        if (currentChunk.match(tokenPattern[tokenName].regex)) {
                            isMatched = true;
                            switch (tokenPattern[tokenName].type) {
                                case T_EOF:
                                    eofExists = true;
                                    break;
                            }
                            var token = new COMPILER.Token();
                            token.setName(tokenName);
                            token.setType(tokenPattern[tokenName].type);
                            token.setValue(currentChunk);
                            tokens.push(token);
                            break;
                        }
                    }
                }
                if (!eofExists) {
                    numWarnings++;
                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing. Adding a EOF token.';
                    var token = new COMPILER.Token();
                    token.setName('T_EOF');
                    token.setType(T_EOF);
                    token.setValue('$');
                    tokens.push(token);
                    COMPILER.Main.addLog(log);
                }
                if (tokens.length === 0) {
                    numErrors++;
                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                }
                if (numErrors === 0) {
                    log.status = LOG_INFO;
                    log.msg = 'Lexer found ' + numErrors + ' error(s) and ' + numWarnings + ' warning(s).';
                }
            }
            else {
                numErrors++;
                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }
            COMPILER.Main.updateTokenTable(tokens);
            COMPILER.Main.addLog(log);
        };
        Lexer.splitCodeBySpace = function (input) {
            var buffer = '';
            var codeChunks = [];
            var splitRegex = /^[\s|\n]+$/;
            for (var i = 0; i < input.length; i++) {
                if (input.charAt(i).match(splitRegex)) {
                    codeChunks.push(buffer);
                    buffer = '';
                }
                else if (i === input.length - 1) {
                    buffer += input.charAt(i);
                    codeChunks.push(buffer);
                }
                else {
                    buffer += input.charAt(i);
                }
            }
            console.log(codeChunks);
            return codeChunks;
        };
        return Lexer;
    })();
    COMPILER.Lexer = Lexer;
})(COMPILER || (COMPILER = {}));
