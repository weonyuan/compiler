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
        // Block $
        Parser.parseProgram = function (tokens) {
            this.parseBlock();
            this.parseEOF();
        };
        // { StatementList }
        Parser.parseBlock = function () {
            console.log('parseBlock()');
            _CurrentToken = this.getNextToken();
            if (_CurrentToken.getType() === T_LBRACE) {
                _CurrentToken = this.getNextToken();
                this.parseStatementList();
                if (_CurrentToken.getType() !== T_RBRACE) {
                    console.log('error');
                }
            }
            else {
                _Errors++;
                var log = {
                    status: null,
                    msg: null
                };
                log.status = LOG_ERROR;
                log.msg = 'Expected \'\{\'';
                COMPILER.Main.addLog(log);
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
                    log.status = LOG_ERROR;
                    log.msg = 'Invalid syntax.';
                    COMPILER.Main.addLog(log);
                    break;
            }
        };
        // print ( Expr )
        Parser.parsePrintStatement = function () {
            console.log('parsePrintStatement()');
            if (_CurrentToken.getType() === T_PRINT) {
                _CurrentToken = this.getNextToken();
                console.log(_CurrentToken);
                if (_CurrentToken.getType() === T_LPAREN) {
                    this.parseExpr();
                    console.log(_CurrentToken);
                    _CurrentToken = this.getNextToken();
                    if (_CurrentToken.getType() !== T_RPAREN) {
                        _CurrentToken = this.getNextToken();
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
                _CurrentToken = this.getNextToken();
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
        // TODO: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            this.parseBooleanExpr();
            this.parseBlock();
        };
        // if BooleanExpr block
        Parser.parseIfStatement = function () {
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() === T_LPAREN) {
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                console.log('expected ( in if statement');
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
                _CurrentToken = this.getNextToken();
                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    // Grab the next token and verify for a digit
                    _CurrentToken = this.getNextToken();
                    this.parseExpr();
                }
            }
            else {
                console.log('not a digit: ' + _CurrentToken.getValue());
            }
        };
        // TODO: " CharList "
        Parser.parseStringExpr = function () {
            if (_CurrentToken.getType() === T_QUOTE) {
                this.parseCharList();
                _CurrentToken = this.getNextToken();
                if (_CurrentToken.getType() !== T_QUOTE) {
                    console.log('parseStringExpr error: expected a quote');
                }
            }
        };
        // ( Expr boolop Expr )
        // boolval
        Parser.parseBooleanExpr = function () {
            if (_CurrentToken.getType() === T_LPAREN) {
                _CurrentToken = this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                if (_CurrentToken.getType() === T_RPAREN) {
                    _CurrentToken = this.getNextToken();
                }
            }
        };
        // char
        Parser.parseId = function () {
            console.log('parseId()');
            if (_CurrentToken.getType() !== T_ID) {
                console.log('parseid error');
            }
            else {
                _CurrentToken = this.getNextToken();
            }
        };
        // TODO
        // char CharList
        // space CharList
        // epsilon
        Parser.parseCharList = function () {
            _CurrentToken = this.getNextToken();
            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    this.parseCharList();
                    break;
                default:
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
                    _CurrentToken = this.getNextToken();
                    break;
                default:
                    console.log('expected a valid data type');
                    break;
            }
        };
        // TODO
        // == | !=
        Parser.parseBoolOp = function () {
            console.log('parseBoolOp()');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                _CurrentToken = this.getNextToken();
            }
            else {
                console.log('expected boolean operator in parsebooleanexpr()');
            }
        };
        // TODO
        // +
        Parser.parseIntOp = function () {
        };
        // $
        Parser.parseEOF = function () {
            _CurrentToken = this.getNextToken();
            if (_CurrentToken.getType() === T_EOF) {
                console.log('found the EOF!');
            }
            else {
                console.log('expected $');
            }
        };
        Parser.getNextToken = function () {
            return _Tokens.shift();
        };
        return Parser;
    })();
    COMPILER.Parser = Parser;
})(COMPILER || (COMPILER = {}));