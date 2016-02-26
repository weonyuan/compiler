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
            COMPILER.Main.resetLogger();
            COMPILER.Main.addLog(LOG_INFO, 'Performing input tokenization through lexer.');
            var tokens = [];
            COMPILER.Main.updateTokenTable(tokens);
            // Delimiters
            var codeChunks = this.splitCodeBySpace(input);
            codeChunks = this.splitChunksToChars(codeChunks);
            if (input.length > 0) {
                var currentIndex = 0;
                var stringMode = false;
                TokenizeLoop: while (codeChunks[currentIndex] !== undefined) {
                    // Scan through the chunks
                    var currentChunk = codeChunks[currentIndex++];
                    // Match the chunk with a token pattern
                    var isMatched = false;
                    var matchedTokenName = this.matchTokenPattern(currentChunk.value);
                    if (matchedTokenName !== null) {
                        isMatched = true;
                        switch (tokenPattern[matchedTokenName].type) {
                            case T_ASSIGN:
                            case T_EXCLAMATION:
                                if (codeChunks[currentIndex + 1] !== undefined) {
                                    if (this.matchTokenPattern(currentChunk.value + codeChunks[currentIndex].value) !== null) {
                                        currentChunk.value += codeChunks[currentIndex++].value;
                                        matchedTokenName = this.matchTokenPattern(currentChunk.value);
                                    }
                                }
                                break;
                            case T_QUOTE:
                                stringMode = !stringMode;
                                break;
                            case T_ID:
                                if (stringMode) {
                                    matchedTokenName = 'T_CHAR';
                                }
                                break;
                            case T_WHITESPACE:
                                if (currentChunk.value.match(/^\n$/)) {
                                    _Errors++;
                                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + (currentChunk.lineNum + 1) + ': Invalid newline character in string found.');
                                    break TokenizeLoop;
                                }
                                break;
                        }
                    }
                    else {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Line ' + currentChunk.lineNum + ': Invalid lexeme ' + currentChunk.value + ' found.');
                        break;
                    }
                    if (isMatched) {
                        var token = new COMPILER.Token();
                        token.setName(matchedTokenName);
                        token.setType(tokenPattern[matchedTokenName].type);
                        token.setValue(currentChunk.value);
                        token.setLineNum(currentChunk.lineNum);
                        tokens.push(token);
                    }
                }
                if (tokens.length === 0) {
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'No tokens were found in input string.');
                }
                if (_Errors === 0) {
                    if (tokenPattern[this.matchTokenPattern(codeChunks[codeChunks.length - 1].value)].type !== T_EOP) {
                        // Send a warning and append a EOP token to the source code
                        _Warnings++;
                        COMPILER.Main.addLog(LOG_WARNING, 'EOP missing. Adding a EOP token.');
                        var token = new COMPILER.Token();
                        token.setName('T_EOP');
                        token.setType(T_EOP);
                        token.setValue('$');
                        token.setLineNum(codeChunks[codeChunks.length - 1].lineNum);
                        tokens.push(token);
                    }
                    COMPILER.Main.updateTokenTable(tokens);
                }
                else {
                    tokens = null;
                }
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'No code to compile!');
            }
            COMPILER.Main.addLog(LOG_INFO, 'Tokenizing complete. Lexer found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            // Reset the warnings and errors for parser
            _Warnings = 0;
            _Errors = 0;
            return tokens;
        };
        // Validate the token with every possible pattern then return a matched token name
        Lexer.matchTokenPattern = function (chunk) {
            var tokenName = null;
            for (name in tokenPattern) {
                if (chunk.match(tokenPattern[name].regex)) {
                    tokenName = name;
                    break;
                }
            }
            return tokenName;
        };
        // Delimit the source code by whitespaces (except for whitespaces in strings)
        Lexer.splitCodeBySpace = function (input) {
            var buffer = '';
            var codeChunks = [];
            var splitRegex = /^[\s|\n]+$/;
            var stringMode = false;
            var currentLineNum = 1;
            for (var i = 0; i < input.length; i++) {
                var chunk = {
                    value: null,
                    lineNum: null
                };
                // Toggle string mode when T_QUOTE is detected
                if (input.charAt(i).match('\"')) {
                    stringMode = !stringMode;
                }
                // If char is a whitespace/newline and stringMode is off
                // push the buffer into the new delimited array then clear it
                if (input.charAt(i).match(splitRegex) && !stringMode) {
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                    // Reset buffer
                    buffer = '';
                    if (input.charAt(i).match(/^\n$/)) {
                        currentLineNum++;
                    }
                }
                else if (i === input.length - 1) {
                    // Last chunk should be pushed whatever is stored in buffer (no wasting!)
                    buffer += input.charAt(i);
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                }
                else {
                    // Otherwise build the buffer - char by char
                    buffer += input.charAt(i);
                }
                // Push every char into the array if stringMode is on
                if (stringMode) {
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                    buffer = '';
                }
            }
            return codeChunks;
        };
        // Delimit the chunks by operators and encapsulators defined in splitRegex
        Lexer.splitChunksToChars = function (codeChunks) {
            var buffer = '';
            var newCodeChunks = [];
            var splitRegex = /^[\{ \ }\(\)\!\=\+]$/;
            for (var i = 0; i < codeChunks.length; i++) {
                var currentChunk = codeChunks[i];
                for (var j = 0; j < currentChunk.value.length; j++) {
                    if (currentChunk.value.charAt(j).match(splitRegex)) {
                        // Push the buffer first before pushing the symbol/operator
                        if (buffer.length > 0) {
                            var bufferChunk = {
                                value: null,
                                lineNum: currentChunk.lineNum
                            };
                            bufferChunk.value = buffer;
                            newCodeChunks.push(bufferChunk);
                            // Remember to empty the buffer after pushing!
                            buffer = '';
                        }
                        var charChunk = {
                            value: null,
                            lineNum: currentChunk.lineNum
                        };
                        charChunk.value = currentChunk.value.charAt(j);
                        newCodeChunks.push(charChunk);
                    }
                    else {
                        // Otherwise build buffer with char
                        buffer += currentChunk.value.charAt(j);
                        // Last chunk should be pushed with whatever buffer we already have
                        if (j === currentChunk.value.length - 1) {
                            var bufferChunk = {
                                value: null,
                                lineNum: currentChunk.lineNum
                            };
                            bufferChunk.value = buffer;
                            newCodeChunks.push(bufferChunk);
                            // Reset buffer
                            buffer = '';
                        }
                    }
                }
            }
            return newCodeChunks;
        };
        return Lexer;
    })();
    COMPILER.Lexer = Lexer;
})(COMPILER || (COMPILER = {}));
