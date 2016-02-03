///<reference path="globals.ts" />
/*
    main.ts

    Responsible for managing the user interface and
    calling the compiler.
*/
var COMPILER;
(function (COMPILER) {
    var Main = (function () {
        function Main() {
        }
        Main.compile = function () {
            var sourceCode = document.getElementById('inputText').value;
            COMPILER.Lexer.tokenize(sourceCode);
        };
        Main.log = function (msg) {
            console.log('log');
            //document.createElement('div')
        };
        return Main;
    })();
    COMPILER.Main = Main;
})(COMPILER || (COMPILER = {}));
