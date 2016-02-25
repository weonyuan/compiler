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
            this.getNextToken();
            this.parseProgram();
        };
        // Block $
        Parser.parseProgram = function () {
            this.parseBlock();
            this.parseEOF();
        };
        // { StatementList }
        Parser.parseBlock = function () {
            if (_CurrentToken.getType() === T_LBRACE) {
                this.getNextToken();
                this.parseStatementList();
                if (_CurrentToken.getType() === T_RBRACE) {
                    this.getNextToken();
                }
                else {
                    console.log('expecting a right brace');
                }
            }
            else {
                _Errors++;
                var log = {
                    status: null,
                    msg: null
                };
                COMPILER.Main.addLog(LOG_ERROR, 'Expected \'\{\'');
            }
        };
        // Statement StatementList
        // epsilon
        Parser.parseStatementList = function () {
            console.log('parseStatementList()');
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
            console.log('parseStatement()');
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
                    var log = {
                        status: null,
                        msg: null
                    };
                    COMPILER.Main.addLog(LOG_ERROR, 'Invalid syntax');
                    break;
            }
        };
        // print ( Expr )
        Parser.parsePrintStatement = function () {
            console.log('parsePrintStatement()');
            if (_CurrentToken.getType() === T_PRINT) {
                this.getNextToken();
                console.log(_CurrentToken);
                if (_CurrentToken.getType() === T_LPAREN) {
                    this.getNextToken();
                    this.parseExpr();
                    console.log(_CurrentToken);
                    if (_CurrentToken.getType() === T_RPAREN) {
                        this.getNextToken();
                    }
                    else {
                        console.log('print statement parse error');
                    }
                }
                else {
                    console.log('print statement parse error');
                }
            }
        };
        // Id = Expr
        Parser.parseAssignmentStatement = function () {
            console.log('parseAssignmentStatement()');
            this.parseId();
            if (_CurrentToken.getType() === T_ASSIGN) {
                this.getNextToken();
                this.parseExpr();
            }
            else {
                console.log('assignment parse error');
            }
        };
        // type Id
        Parser.parseVarDecl = function () {
            console.log('parseVarDecl()');
            this.parseType();
            this.parseId();
        };
        // while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            if (_CurrentToken.getType() === T_WHILE) {
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                console.log('error parsing while statement');
            }
        };
        // if BooleanExpr block
        Parser.parseIfStatement = function () {
            if (_CurrentToken.getType() === T_IF) {
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                console.log('error parsing if statement');
            }
        };
        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        Parser.parseExpr = function () {
            console.log('parseExpr()');
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
                    console.log('parseExpr error');
                    break;
            }
        };
        // digit intop Expr
        // digit
        Parser.parseIntExpr = function () {
            console.log('parseIntExpr()');
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
                console.log('not a digit: ' + _CurrentToken.getValue());
            }
        };
        // " CharList "
        Parser.parseStringExpr = function () {
            console.log('parseStringExpr()');
            if (_CurrentToken.getType() === T_QUOTE) {
                this.getNextToken();
                this.parseCharList();
                if (_CurrentToken.getType() === T_QUOTE) {
                    this.getNextToken();
                }
                else {
                    console.log('parseStringExpr error: expected a quote');
                }
            }
            else {
                console.log('expected a quote');
            }
        };
        // ( Expr boolop Expr )
        // boolval
        Parser.parseBooleanExpr = function () {
            console.log('parseBooleanExpr()');
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
                console.log('error parsing boolean expression');
            }
        };
        // char
        Parser.parseId = function () {
            console.log('parseId()');
            if (_CurrentToken.getType() !== T_ID) {
                console.log('parseid error');
            }
            else {
                this.getNextToken();
            }
        };
        // char CharList
        // space CharList
        // epsilon
        Parser.parseCharList = function () {
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
            console.log('parseType()');
            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    this.getNextToken();
                    break;
                default:
                    console.log('expected a valid data type');
                    break;
            }
        };
        // == | !=
        Parser.parseBoolOp = function () {
            console.log('parseBoolOp()');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                this.getNextToken();
            }
            else {
                console.log('expected boolean operator in parsebooleanexpr()');
            }
        };
        // $
        Parser.parseEOF = function () {
            console.log('parseEOF()');
            if (_CurrentToken.getType() === T_EOF) {
                console.log('found the EOF!');
                this.getNextToken();
                if (_CurrentToken !== null && _CurrentToken !== undefined) {
                    this.parseProgram();
                }
            }
            else {
                console.log('expected $');
            }
        };
        Parser.getNextToken = function () {
            _CurrentToken = _Tokens.shift();
        };
        return Parser;
    })();
    COMPILER.Parser = Parser;
})(COMPILER || (COMPILER = {}));
