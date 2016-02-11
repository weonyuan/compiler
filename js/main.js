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
            this.log('');
        };
        Main.log = function (msg) {
            var divLog = document.createElement('div');
            divLog.className = 'log';
            document.getElementById('logger').appendChild(divLog);
            var divLogStatus = document.createElement('div');
            divLogStatus.className = 'label label-info status';
            divLogStatus.innerHTML = 'INFO';
            var lastLog = document.getElementsByClassName('log')[document.getElementsByClassName('log').length - 1];
            lastLog.appendChild(divLogStatus);
            var divLogMessage = document.createElement('div');
            divLogMessage.className = 'message';
            divLogMessage.innerHTML = 'Performing something...';
            lastLog.appendChild(divLogMessage);
        };
        return Main;
    })();
    COMPILER.Main = Main;
})(COMPILER || (COMPILER = {}));
