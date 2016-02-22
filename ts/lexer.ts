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

            var codeChunks: string[] = this.splitCodeBySpace(input);

            codeChunks = this.splitChunksToChars(codeChunks);

            var eofExists: boolean = false;

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
                var currentIndex: number = 0;
                var numErrors: number = 0;
                var numWarnings: number = 0;
                var stringMode: boolean = false;

                while (currentIndex < codeChunks.length && !eofExists) {
                    // Scan through the chunks
                    var currentChunk: string = codeChunks[currentIndex++];

                    // Match the chunk with a token pattern
                    var isMatched: boolean = false;
                    var matchedTokenName: string = this.matchTokenPattern(currentChunk)
                    if (matchedTokenName !== null) {
                        isMatched = true;

                        switch (tokenPattern[matchedTokenName].type) {
                            case T_ASSIGN:
                                if (codeChunks[currentIndex + 1] !== undefined) {
                                    if (this.matchTokenPattern(currentChunk + codeChunks[currentIndex]) !== null) {
                                        console.log('triggered');
                                        currentChunk += codeChunks[currentIndex++];
                                        matchedTokenName = this.matchTokenPattern(currentChunk);
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
                            case T_EOF:
                                eofExists = true;
                                break;
                        }
                    }

                    if (isMatched) {
                        var token = new Token();
                        token.setName(matchedTokenName);
                        token.setType(tokenPattern[matchedTokenName].type);
                        token.setValue(currentChunk);

                        tokens.push(token);
                    }
                }

                if (!eofExists) {
                    numWarnings++;

                    log.status = LOG_WARNING;
                    log.msg = 'EOF missing. Adding a EOF token.';

                    var token = new Token();
                    token.setName('T_EOF');
                    token.setType(T_EOF);
                    token.setValue('$');

                    tokens.push(token);

                    Main.addLog(log);
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
            } else {
                numErrors++;

                log.status = LOG_ERROR;
                log.msg = 'No code to compile.';
            }

            Main.updateTokenTable(tokens);
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
            var codeChunks: string[] = [];
            var splitRegex = /^[\s|\n]+$/
            var stringMode: boolean = false;

            for (var i = 0; i < input.length; i++) {
                if (input.charAt(i).match('\"')) {
                    stringMode = !stringMode;
                }

                if (input.charAt(i).match(splitRegex) && !stringMode) {
                    codeChunks.push(buffer);
                    buffer = '';
                } else if (i === input.length - 1) {
                    buffer += input.charAt(i);
                    codeChunks.push(buffer);
                } else {
                    buffer += input.charAt(i);
                }

                if (stringMode) {
                    codeChunks.push(buffer);
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
                var currentChunk: string = codeChunks[i];

                for (var j = 0; j < codeChunks[i].length; j++) {
                    if (codeChunks[i].charAt(j).match(splitRegex)) {
                        newCodeChunks.push(buffer);
                        newCodeChunks.push(codeChunks[i].charAt(j));
                        buffer = '';
                    } else {
                        buffer += codeChunks[i].charAt(j);

                        if (j === codeChunks[i].length - 1) {
                            newCodeChunks.push(buffer);
                            buffer = '';
                        }
                    }

                    console.log(buffer);
                }
            }
            console.log(newCodeChunks);
            return newCodeChunks;
        }
    }
}