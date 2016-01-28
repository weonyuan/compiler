/*
    main.ts

    Responsible for managing the user interface and
    calling the compiler.
*/
var Compiler;
(function (Compiler) {
    var Main = (function () {
        function Main() {
        }
        Main.prototype.compile = function () {
            Compiler.Lexer.tokenize();
        };
        return Main;
    })();
    Compiler.Main = Main;
})(Compiler || (Compiler = {}));
