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
        Main.addLog = function (log) {
            // Construct the log's DOM
            var divLog = document.createElement('div');
            divLog.className = 'log';
            document.getElementById('logger').appendChild(divLog);
            // Inside the newly created DOM, find the appropriate status
            var divLogStatus = document.createElement('div');
            divLogStatus.className = 'label status';
            switch (log.status) {
                case LOG_ERROR:
                    divLogStatus.className += ' label-danger';
                    divLogStatus.innerHTML = 'ERROR';
                    break;
                case LOG_WARNING:
                    divLogStatus.className += ' label-warning';
                    divLogStatus.innerHTML = 'WARNING';
                    break;
                case LOG_INFO:
                    divLogStatus.className += ' label-info';
                    divLogStatus.innerHTML = 'INFO';
                    break;
                case LOG_SUCCESS:
                    divLogStatus.className += ' label-success';
                    divLogStatus.innerHTML = 'SUCCESS';
                    break;
                default:
                    divLogStatus.className += ' label-danger';
                    divLogStatus.innerHTML = 'ERROR';
                    break;
            }
            var lastLog = document.getElementsByClassName('log')[document.getElementsByClassName('log').length - 1];
            lastLog.appendChild(divLogStatus);
            // And finally, append the message inside the log
            var divLogMsg = document.createElement('div');
            divLogMsg.className = 'message';
            divLogMsg.innerHTML = log.msg;
            lastLog.appendChild(divLogMsg);
        };
        Main.resetLog = function () {
            // Reset the logger
            document.getElementById('logger').innerHTML = '';
        };
        return Main;
    })();
    COMPILER.Main = Main;
})(COMPILER || (COMPILER = {}));
