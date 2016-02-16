///<reference path="globals.ts" />
/*
  token.ts

  Constructor for a token.
*/
var COMPILER;
(function (COMPILER) {
    var Token = (function () {
        function Token(name, type, value, lineNum) {
            if (name === void 0) { name = ''; }
            if (type === void 0) { type = 0; }
            if (value === void 0) { value = ''; }
            if (lineNum === void 0) { lineNum = 0; }
            this.name = name;
            this.type = type;
            this.value = value;
            this.lineNum = lineNum;
        }
        Token.prototype.getName = function () {
            return this.name;
        };
        Token.prototype.getType = function () {
            return this.type;
        };
        Token.prototype.getValue = function () {
            return this.value;
        };
        Token.prototype.getLineNum = function () {
            return this.lineNum;
        };
        Token.prototype.setName = function (name) {
            this.name = name;
        };
        Token.prototype.setType = function (type) {
            this.type = type;
        };
        Token.prototype.setValue = function (value) {
            this.value = value;
        };
        Token.prototype.setLineNum = function (lineNum) {
            this.lineNum = lineNum;
        };
        return Token;
    })();
    COMPILER.Token = Token;
})(COMPILER || (COMPILER = {}));
