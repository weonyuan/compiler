///<reference path="main.ts" />
/*
    lexer.ts

    Responsible for tokenizing the input code and storing
    the tokens in a list.
*/
var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        Lexer.prototype.tokenize = function () {
            console.log('performing tokenize()');
            var tokens = [];
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
