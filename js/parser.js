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
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() === T_LBRACE) {
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
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
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
            if (_CurrentToken.getType() === T_PRINT) {
                _CurrentToken = this.getNextToken();
                console.log(_CurrentToken);
                if (_CurrentToken.getType() === T_LPAREN) {
                    this.parseExpr();
                    _CurrentToken = this.getNextToken();
                    console.log(_CurrentToken);
                    if (_CurrentToken.getType() !== T_RPAREN) {
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
            this.parseId();
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken === T_ASSIGN) {
                this.parseExpr();
            }
            else {
                console.log('assignment parse error');
            }
        };
        // type Id
        Parser.parseVarDecl = function () {
            this.parseType();
            this.parseId();
        };
        // while BooleanExpr Block
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
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            switch (_CurrentToken.getType()) {
                case T_INT:
                    this.parseIntExpr();
                    break;
                case T_STRING:
                    this.parseStringExpr();
                    break;
                case T_BOOLEAN:
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
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() === T_DIGIT) {
                if (this.getNextToken() === T_ADD) {
                    _CurrentToken = this.getNextToken();
                    switch (_CurrentToken.getType()) {
                        case T_INT:
                        case T_STRING:
                        case T_BOOLEAN:
                        case T_ID:
                            this.parseExpr();
                            break;
                        default:
                            console.log('parseIntExpr error');
                            break;
                    }
                }
            }
            else {
                console.log('not a digit: ' + _CurrentToken.getValue());
            }
        };
        // " CharList "
        Parser.parseStringExpr = function () {
        };
        // ( Expr boolop Expr )
        // boolval
        Parser.parseBooleanExpr = function () {
            this.parseExpr();
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken === T_EQUAL || _CurrentToken === T_NOTEQUAL) {
                this.parseExpr();
                _CurrentToken = this.getNextToken();
                console.log(_CurrentToken);
                if (_CurrentToken !== T_RPAREN) {
                    console.log('expected right param in boolean expr parse');
                }
            }
            else {
                console.log('expected boolean operator in parsebooleanexpr()');
            }
        };
        // char
        Parser.parseId = function () {
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() !== T_ID) {
                console.log('error');
            }
        };
        // char CharList
        // space CharList
        // epsilon
        Parser.parseCharList = function () {
        };
        // int | string | boolean
        Parser.parseType = function () {
        };
        // == | !=
        Parser.parseBoolOp = function () {
        };
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
