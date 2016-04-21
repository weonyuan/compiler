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
        // What more can I say? It is called after hitting the Compile button
        Main.compile = function () {
            // Reset everything first
            _Symbols = 0;
            _CST = null;
            _AST = null;
            this.resetLogger();
            this.resetSymbolTable();
            var sourceCode = document.getElementById('inputText').value;
            setTimeout(function () {
                _Tokens = COMPILER.Lexer.tokenize(sourceCode);
                // Only parse when we actually have tokens!
                if (_Tokens !== null && _Tokens !== undefined && _Tokens.length > 0) {
                    COMPILER.Parser.init(_Tokens);
                }
                // Only analyse when we have a CST!
                if (_CST !== null) {
                    _SymbolTable = COMPILER.SemanticAnalyzer.init();
                }
                if (_SymbolTable !== null) {
                    COMPILER.CodeGenerator.build();
                }
            }, 90);
        };
        // Load the source code from the testPrograms array into the textarea
        Main.loadProgram = function (index) {
            document.getElementById('inputText').value = testPrograms[index];
        };
        // Changes the verbose mode button value and color
        Main.toggleVerboseMode = function () {
            _VerboseMode = !_VerboseMode;
            if (_VerboseMode) {
                document.getElementById('btnVerbose').innerHTML = 'Verbose On';
                document.getElementById('btnVerbose').className = 'btn btn-success';
            }
            else {
                document.getElementById('btnVerbose').innerHTML = 'Verbose Off';
                document.getElementById('btnVerbose').className = 'btn btn-danger';
            }
        };
        // Used for listing all tokens after lexical analysis
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
        // Enough said
        Main.resetTokenTable = function () {
            var tokenTable = document.getElementById('tokenTable');
            var tokenIndex = 0;
            var currentToken = document.getElementById('token-' + tokenIndex);
            while (currentToken !== null) {
                tokenTable.removeChild(currentToken);
                currentToken = document.getElementById('token-' + ++tokenIndex);
            }
        };
        // Used for listing all tokens after lexical analysis
        Main.addSymbol = function (id, name, dataType, lineNum, scopeNum) {
            var symbolTable = document.getElementById('symbolTable');
            var symbol = document.createElement('tr');
            symbol.id = 'symbol-' + id;
            symbolTable.appendChild(symbol);
            var symbolLineNum = document.createElement('td');
            symbolLineNum.innerHTML = lineNum;
            symbol.appendChild(symbolLineNum);
            var symbolName = document.createElement('td');
            symbolName.innerHTML = name;
            symbol.appendChild(symbolName);
            var symbolType = document.createElement('td');
            symbolType.innerHTML = dataType;
            symbol.appendChild(symbolType);
            var symbolScope = document.createElement('td');
            symbolScope.innerHTML = scopeNum;
            symbol.appendChild(symbolScope);
        };
        // Enough said
        Main.resetSymbolTable = function () {
            var symbolTable = document.getElementById('symbolTable');
            var symbolIndex = 0;
            var currentSymbol = document.getElementById('symbol-' + symbolIndex);
            while (currentSymbol !== null) {
                symbolTable.removeChild(currentSymbol);
                currentSymbol = document.getElementById('symbol-' + ++symbolIndex);
            }
        };
        // Appends a log in logger based on status
        Main.addLog = function (status, msg) {
            // Inside the soon to be created log, find the appropriate status
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
            if (divLogStatus.innerHTML.length > 0) {
                // Construct the log's DOM
                var divLog = document.createElement('div');
                divLog.className = 'log';
                document.getElementById('logger').appendChild(divLog);
                var lastLog = document.getElementsByClassName('log')[document.getElementsByClassName('log').length - 1];
                lastLog.appendChild(divLogStatus);
                // And finally, append the message inside the log
                var divLogMsg = document.createElement('div');
                divLogMsg.className = 'message';
                divLogMsg.innerHTML = msg;
                lastLog.appendChild(divLogMsg);
            }
        };
        // Do I need to say more?
        Main.resetLogger = function () {
            document.getElementById('logger').innerHTML = '';
        };
        return Main;
    })();
    COMPILER.Main = Main;
})(COMPILER || (COMPILER = {}));
