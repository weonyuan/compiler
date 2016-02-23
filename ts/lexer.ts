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
            Main.updateTokenTable(tokens);

            var codeChunks: any = this.splitCodeBySpace(input);
            console.log(codeChunks);
            codeChunks = this.splitChunksToChars(codeChunks);

            var eofExists: boolean = false;

            if (input.length > 0) {
                var currentIndex: number = 0;
                var numErrors: number = 0;
                var numWarnings: number = 0;
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
                                        currentChunk += codeChunks[currentIndex++];
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
                                    numErrors++;

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
                        numErrors++;

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
                    numErrors++;

                    log.status = LOG_ERROR;
                    log.msg = 'No tokens were found in input string.';
                    Main.addLog(log);
                } else if (numErrors === 0 && !eofExists) {
                    numWarnings++;

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
                    log.msg = 'Lexer found ' + numErrors + ' error(s) and ' + numWarnings + ' warning(s).';
                }

                if (numErrors === 0) {
                    Main.updateTokenTable(tokens);
                }

            } else {
                numErrors++;

                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }

            Main.addLog(log);
        }

        public static matchTokenPattern(chunk): string {
            var tokenName: string = null;
            for (name in tokenPattern) {
                if (chunk.match(tokenPattern[name].regex)) {
                    tokenName = name;
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
                        console.log('new line!');
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
            var newCodeChunks: string[] = [];
            var splitRegex = /^[\{ \ }\(\)\!\=\+]$/;

            for (var i = 0; i < codeChunks.length; i++) {
                var currentChunk = codeChunks[i];

                for (var j = 0; j < currentChunk.value.length; j++) {
                    if (currentChunk.value.charAt(j).match(splitRegex)) {                        
                        if (buffer.length > 0) {
                            newCodeChunks.push(currentChunk);
                            buffer = '';
                        }

                        newCodeChunks.push(currentChunk);
                    } else {
                        buffer += currentChunk.value.charAt(j);

                        if (j === currentChunk.value.length - 1) {
                            newCodeChunks.push(currentChunk);
                            buffer = '';
                        }
                    }
                }
            }
            console.log(newCodeChunks);
            return newCodeChunks;
        }
    }
}