///<reference path="globals.ts" />
/*
  token.ts

  Constructor for a token.
*/
var COMPILER;
(function (COMPILER) {
    var Token = (function () {
        function Token(type, lineNum) {
            if (type === void 0) { type = 0; }
            if (lineNum === void 0) { lineNum = 0; }
            this.type = type;
            this.lineNum = lineNum;
        }
        Token.getType = function () {
            return this.type;
        };
        Token.getLineNum = function () {
            return this.lineNum;
        };
        return Token;
    })();
    COMPILER.Token = Token;
})(COMPILER || (COMPILER = {}));
