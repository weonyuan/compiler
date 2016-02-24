///<reference path="token.ts" />

///<reference path="globals.ts" />
/*
    lexer.ts

    Responsible for tokenizing the input code and storing
    the tokens in a list.
*/

module COMPILER {
    export class Lexer {
        public static tokenize(input): any {
            Main.resetLog();

            var log = {
                status: null,
                msg: null
            }

            log.status = LOG_INFO;
            log.msg = 'Performing input tokenization through lexer.';
            Main.addLog(log);

            var tokens: any = [];
            Main.updateTokenTable(tokens);

            var codeChunks: any = this.splitCodeBySpace(input);
            codeChunks = this.splitChunksToChars(codeChunks);

            var eofExists: boolean = false;

            if (input.length > 0) {
                var currentIndex: number = 0;
                var _Errors: number = 0;
                var _Warnings: number = 0;
                var stringMode: boolean = false;

                TokenizeLoop:
                while (currentIndex < codeChunks.length && !eofExists) {
                    // Scan through the chunks
                    var currentChunk: any = codeChunks[currentIndex++];

                    // Match the chunk with a token pattern
                    var isMatched: boolean = false;
                    var matchedTokenName: string = this.matchTokenPattern(currentChunk.value)
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
                            case T_CHAR:
                                if (!stringMode) {
                                    matchedTokenName = 'T_ID';
                                }
                                break;
                            case T_WHITESPACE:
                                if (currentChunk.value.match(/^\n$/)) {
                                    _Errors++;

                                    log.status = LOG_ERROR;
                                    log.msg = 'Newline is not allowed in strings.';
                                    Main.addLog(log);
                                    break TokenizeLoop;
                                }
                                break;
                            case T_EOF:
                                eofExists = true;
                                break;
                        }
                    } else {
                        _Errors++;

                        log.status = LOG_ERROR;
                        log.msg = 'Invalid lexeme ' + currentChunk.value + ' found at line ' + currentChunk.lineNum;
                        Main.addLog(log);

                        break;
                    }

                    if (isMatched) {
                        var token = new Token();
                        token.setName(matchedTokenName);
                        token.setType(tokenPattern[matchedTokenName].type);
                        token.setValue(currentChunk.value);
                        token.setLineNum(currentChunk.lineNum);

                        tokens.push(token);
                    }
                }

                if (tokens.length === 0) {
                    _Errors++;

                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                } else if (_Errors === 0 && !eofExists) {
                    _Warnings++;

                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing. Adding a EOF token.';

                    var token = new Token();
                    token.setName('T_EOF');
                    token.setType(T_EOF);
                    token.setValue('$');
                    token.setLineNum(codeChunks[codeChunks.length - 1].lineNum);

                    tokens.push(token);
                } else {
                    log.status = LOG_INFO;
                    log.msg = 'Lexer found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).';
                }

                if (_Errors === 0) {
                    Main.updateTokenTable(tokens);
                }

            } else {
                _Errors++;

                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }

            Main.addLog(log);

            return tokens;
        }

        public static matchTokenPattern(chunk): string {
            var tokenName: string = null;
            for (name in tokenPattern) {
                if (chunk.match(tokenPattern[name].regex)) {
                    tokenName = name;
                    break;
                }
            }
            
            return tokenName;
        }

        public static splitCodeBySpace(input): string[] {
            var buffer: string = '';
            var codeChunks = [];
            var splitRegex = /^[\s|\n]+$/
            var stringMode: boolean = false;
            var currentLineNum: number = 1;

            for (var i = 0; i < input.length; i++) {
                var chunk = {
                    value: null,
                    lineNum: null
                };

                if (input.charAt(i).match('\"')) {
                    stringMode = !stringMode;
                }
                

                if (input.charAt(i).match(splitRegex) && !stringMode) {
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                    buffer = '';

                    if (input.charAt(i).match(/^\n$/)) {
                        currentLineNum++;
                    }
                } else if (i === input.length - 1) {
                    buffer += input.charAt(i);
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                } else {
                    buffer += input.charAt(i);
                }

                if (stringMode) {
                    chunk.value = buffer;
                    chunk.lineNum = currentLineNum;
                    codeChunks.push(chunk);
                    buffer = '';
                }
            }

            return codeChunks;
        }

        public static splitChunksToChars(codeChunks): string[] {
            var buffer: string = '';
            var newCodeChunks: any[] = [];
            var splitRegex = /^[\{ \ }\(\)\!\=\+]$/;

            for (var i = 0; i < codeChunks.length; i++) {
                var currentChunk = codeChunks[i];

                for (var j = 0; j < currentChunk.value.length; j++) {
                    if (currentChunk.value.charAt(j).match(splitRegex)) {
                        if (buffer.length > 0) {
                            var bufferChunk = {
                                value: null,
                                lineNum: currentChunk.lineNum
                            };

                            bufferChunk.value = buffer;
                            newCodeChunks.push(bufferChunk);
                            buffer = '';
                        }
                        
                        var charChunk = {
                            value: null,
                            lineNum: currentChunk.lineNum
                        };

                        charChunk.value = currentChunk.value.charAt(j);
                        newCodeChunks.push(charChunk);    
                    } else {
                        buffer += currentChunk.value.charAt(j);

                        if (j === currentChunk.value.length - 1) {
                            var bufferChunk = {
                                value: null,
                                lineNum: currentChunk.lineNum
                            };

                            bufferChunk.value = buffer;
                            newCodeChunks.push(bufferChunk);
                            buffer = '';
                        }
                    }
                }
            }
            return newCodeChunks;
        }
    }
}