///<reference path="globals.ts" />
/*
    parser.ts

    Responsible for receiving the tokens from lexer
    and validating the input's syntax.
*/
var COMPILER;
(function (COMPILER) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.init = function (tokens) {
            COMPILER.Main.addLog(LOG_INFO, 'Performing parsing.');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Initializing verbose mode!');
            // Load up the first token and let's get parsing!
            this.getNextToken();
            _PreviousToken = _CurrentToken;
            this.parseProgram();
        };
        // Block $
        Parser.parseProgram = function () {
            // console.log('parseProgram()');
            this.parseBlock();
            this.parseEOP();
        };
        // { StatementList }
        Parser.parseBlock = function () {
            // console.log('parseBlock()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a left brace.');
            if (_CurrentToken.getType() === T_LBRACE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left brace!');
                this.getNextToken();
                this.parseStatementList();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right brace.');
                if (_CurrentToken.getType() === T_RBRACE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right brace!');
                    this.getNextToken();
                }
                else {
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': Expected T_RBRACE but received ' + _CurrentToken.getName() + '.');
                }
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_LBRACE but received ' + _CurrentToken.getName() + '.');
            }
        };
        // Statement StatementList
        // epsilon
        Parser.parseStatementList = function () {
            // console.log('parseStatementList()');
            switch (_CurrentToken.getType()) {
                case T_PRINT:
                case T_WHILE:
                case T_IF:
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                case T_ID:
                case T_LBRACE:
                    this.parseStatement();
                    this.parseStatementList();
                    break;
                default:
                    // epsilon
                    break;
            }
        };
        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        Parser.parseStatement = function () {
            // console.log('parseStatement()');
            switch (_CurrentToken.getType()) {
                case T_PRINT:
                    this.parsePrintStatement();
                    break;
                case T_WHILE:
                    this.parseWhileStatement();
                    break;
                case T_IF:
                    this.parseIfStatement();
                    break;
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    this.parseVarDecl();
                    break;
                case T_ID:
                    this.parseAssignmentStatement();
                    break;
                case T_LBRACE:
                    this.parseBlock();
                    break;
                default:
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': ' + _CurrentToken.getName() + ' is not a valid statement.');
                    break;
            }
        };
        // print ( Expr )
        Parser.parsePrintStatement = function () {
            // console.log('parsePrintStatement()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a print.');
            if (_CurrentToken.getType() === T_PRINT) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a print!');
                this.getNextToken();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a left parenthese.');
                if (_CurrentToken.getType() === T_LPAREN) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                    this.getNextToken();
                    this.parseExpr();
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');
                    if (_CurrentToken.getType() === T_RPAREN) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                        this.getNextToken();
                    }
                    else {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                            ': Expected T_RPAREN but received ' + _CurrentToken.getName() + '.');
                    }
                }
                else {
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': Expected T_LPAREN but received ' + _CurrentToken.getName() + '.');
                }
            }
        };
        // Id = Expr
        Parser.parseAssignmentStatement = function () {
            // console.log('parseAssignmentStatement()');
            this.parseId();
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an equal sign.');
            if (_CurrentToken.getType() === T_ASSIGN) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an equal sign!');
                this.getNextToken();
                this.parseExpr();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_ASSIGN but received ' + _CurrentToken.getName() + '.');
            }
        };
        // type Id
        Parser.parseVarDecl = function () {
            // console.log('parseVarDecl()');
            this.parseType();
            this.parseId();
        };
        // while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            // console.log('parseWhileStatement()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a while.');
            if (_CurrentToken.getType() === T_WHILE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a while!');
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_WHILE but received ' + _CurrentToken.getName() + '.');
            }
        };
        // if BooleanExpr block
        Parser.parseIfStatement = function () {
            // console.log('parseIfStatement()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an if.');
            if (_CurrentToken.getType() === T_IF) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an if!');
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_IF but received ' + _CurrentToken.getName() + '.');
            }
        };
        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        Parser.parseExpr = function () {
            // console.log('parseExpr()');
            switch (_CurrentToken.getType()) {
                case T_DIGIT:
                    this.parseIntExpr();
                    break;
                case T_QUOTE:
                    this.parseStringExpr();
                    break;
                case T_TRUE:
                case T_FALSE:
                case T_LPAREN:
                    this.parseBooleanExpr();
                    break;
                case T_ID:
                    this.parseId();
                    break;
                default:
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': ' + _CurrentToken.getName() + ' is not a valid expression.');
                    break;
            }
        };
        // digit intop Expr
        // digit
        Parser.parseIntExpr = function () {
            // console.log('parseIntExpr()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a digit.');
            if (_CurrentToken.getType() === T_DIGIT) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a digit!');
                this.getNextToken();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a plus sign.');
                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a plus sign!');
                    // Grab the next token and verify for a digit
                    this.getNextToken();
                    this.parseExpr();
                }
            }
            else {
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_DIGIT but received ' + _CurrentToken.getName() + '.');
            }
        };
        // " CharList "
        Parser.parseStringExpr = function () {
            // console.log('parseStringExpr()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a quote.');
            if (_CurrentToken.getType() === T_QUOTE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a quote!');
                this.getNextToken();
                this.parseCharList();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a quote.');
                if (_CurrentToken.getType() === T_QUOTE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a quote!');
                    this.getNextToken();
                }
                else {
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': Expected T_QUOTE but received ' + _CurrentToken.getName() + '.');
                }
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_QUOTE but received ' + _CurrentToken.getName() + '.');
            }
        };
        // ( Expr boolop Expr )
        // boolval
        Parser.parseBooleanExpr = function () {
            // console.log('parseBooleanExpr()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting either a left parenthese or a boolean.');
            if (_CurrentToken.getType() === T_LPAREN) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');
                if (_CurrentToken.getType() === T_RPAREN) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                    this.getNextToken();
                }
            }
            else if (_CurrentToken.getType() === T_TRUE
                || _CurrentToken.getType() === T_FALSE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                this.getNextToken();
            }
            else {
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': ' + _CurrentToken.getName() + ' is not a valid boolean expression.');
            }
        };
        // char
        Parser.parseId = function () {
            // console.log('parseId()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an id.');
            if (_CurrentToken.getType() === T_ID) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an id!');
                this.getNextToken();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_ID but received ' + _CurrentToken.getName() + '.');
            }
        };
        // char CharList
        // space CharList
        // epsilon
        Parser.parseCharList = function () {
            // console.log('parseCharList()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a character.');
            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a character!');
                    this.getNextToken();
                    this.parseCharList();
                    break;
                default:
                    // epsilon
                    break;
            }
        };
        // int | string | boolean
        Parser.parseType = function () {
            // console.log('parseType()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a valid data type.');
            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                    this.getNextToken();
                    break;
                default:
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': Expected T_TYPE but received ' + _CurrentToken.getName() + '.');
                    break;
            }
        };
        // == | !=
        Parser.parseBoolOp = function () {
            // console.log('parseBoolOp()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a boolean operator.');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a boolean operator!');
                this.getNextToken();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }
        };
        // $
        Parser.parseEOP = function () {
            // console.log('parseEOP()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an end of program character.');
            if (_CurrentToken.getType() === T_EOP) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an end of program character!');
                this.getNextToken();
                if (_CurrentToken !== null && _CurrentToken !== undefined) {
                    this.parseProgram();
                }
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_EOP but received ' + _CurrentToken.getName() + '.');
            }
        };
        Parser.getNextToken = function () {
            _PreviousToken = _CurrentToken;
            _CurrentToken = _Tokens.shift();
        };
        Parser.printResults = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Parsing complete. Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _Warnings = 0;
            _Errors = 0;
        };
        return Parser;
    })();
    COMPILER.Parser = Parser;
})(COMPILER || (COMPILER = {}));
