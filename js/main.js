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
            _Tokens = COMPILER.Lexer.tokenize(sourceCode);
            if (_Tokens !== null && _Tokens !== undefined) {
                COMPILER.Parser.init(_Tokens);
                COMPILER.Parser.printResults();
            }
        };
        Main.toggleVerboseMode = function () {
            _VerboseMode = !_VerboseMode;
            if (_VerboseMode) {
                document.getElementById('btnVerbose').innerHTML = 'Verbose On';
                document.getElementById('btnVerbose').className = 'btn btn-success col-sm-2 col-md-1';
            }
            else {
                document.getElementById('btnVerbose').innerHTML = 'Verbose Off';
                document.getElementById('btnVerbose').className = 'btn btn-danger col-sm-2 col-md-1';
            }
        };
        Main.updateTokenTable = function (tokens) {
            this.resetTokenTable();
            var tokenTable = document.getElementById('tokenTable');
            for (var i = 0; i < tokens.length; i++) {
                var token = document.createElement('tr');
                token.id = 'token-' + i;
                tokenTable.appendChild(token);
                var tokenName = document.createElement('td');
                tokenName.innerHTML = tokens[i].getName();
                token.appendChild(tokenName);
                var tokenValue = document.createElement('td');
                tokenValue.innerHTML = tokens[i].getValue();
                token.appendChild(tokenValue);
            }
        };
        Main.resetTokenTable = function () {
            var tokenTable = document.getElementById('tokenTable');
            var tokenIndex = 0;
            var currentToken = document.getElementById('token-' + tokenIndex);
            while (currentToken !== null) {
                tokenTable.removeChild(currentToken);
                currentToken = document.getElementById('token-' + ++tokenIndex);
            }
        };
        Main.addLog = function (status, msg) {
            // Construct the log's DOM
            var divLog = document.createElement('div');
            divLog.className = 'log';
            document.getElementById('logger').appendChild(divLog);
            // Inside the newly created DOM, find the appropriate status
            var divLogStatus = document.createElement('div');
            divLogStatus.className = 'label status';
            switch (status) {
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
                case LOG_VERBOSE:
                    divLogStatus.className += ' label-primary';
                    divLogStatus.innerHTML = 'VERBOSE';
                    break;
                default:
                    divLogStatus.className += ' label-danger';
                    divLogStatus.innerHTML = 'ERROR';
                    break;
            }
            if (status === LOG_VERBOSE && !_VerboseMode) {
                return;
            }
            var lastLog = document.getElementsByClassName('log')[document.getElementsByClassName('log').length - 1];
            lastLog.appendChild(divLogStatus);
            // And finally, append the message inside the log
            var divLogMsg = document.createElement('div');
            divLogMsg.className = 'message';
            divLogMsg.innerHTML = msg;
            lastLog.appendChild(divLogMsg);
        };
        Main.resetLogger = function () {
            document.getElementById('logger').innerHTML = '';
        };
        return Main;
    })();
    COMPILER.Main = Main;
})(COMPILER || (COMPILER = {}));
