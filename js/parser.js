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
            // Load up the first token and let's get parsing!
            this.getNextToken();
            _PreviousToken = _CurrentToken;
            this.parseProgram();
        };
        // Block $
        Parser.parseProgram = function () {
            // console.log('parseProgram()');
            this.parseBlock();
            this.parseEOF();
        };
        // { StatementList }
        Parser.parseBlock = function () {
            // console.log('parseBlock()');
            if (_CurrentToken.getType() === T_LBRACE) {
                this.getNextToken();
                this.parseStatementList();
                if (_CurrentToken.getType() === T_RBRACE) {
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
            if (_CurrentToken.getType() === T_PRINT) {
                this.getNextToken();
                if (_CurrentToken.getType() === T_LPAREN) {
                    this.getNextToken();
                    this.parseExpr();
                    if (_CurrentToken.getType() === T_RPAREN) {
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
            if (_CurrentToken.getType() === T_ASSIGN) {
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
            if (_CurrentToken.getType() === T_WHILE) {
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
            if (_CurrentToken.getType() === T_IF) {
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
            if (_CurrentToken.getType() === T_DIGIT) {
                this.getNextToken();
                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
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
            if (_CurrentToken.getType() === T_QUOTE) {
                this.getNextToken();
                this.parseCharList();
                if (_CurrentToken.getType() === T_QUOTE) {
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
            if (_CurrentToken.getType() === T_LPAREN) {
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                if (_CurrentToken.getType() === T_RPAREN) {
                    this.getNextToken();
                }
            }
            else if (_CurrentToken.getType() === T_TRUE
                || _CurrentToken.getType() === T_FALSE) {
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
            if (_CurrentToken.getType() === T_ID) {
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
            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
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
            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
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
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                this.getNextToken();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }
        };
        // $
        Parser.parseEOF = function () {
            // console.log('parseEOF()');
            if (_CurrentToken.getType() === T_EOF) {
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
            COMPILER.Main.addLog(LOG_INFO, 'Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _Warnings = 0;
            _Errors = 0;
        };
        return Parser;
    })();
    COMPILER.Parser = Parser;
})(COMPILER || (COMPILER = {}));
