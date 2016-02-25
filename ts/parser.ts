///<reference path="globals.ts" />
/*
    parser.ts

    Responsible for receiving the tokens from lexer
    and validating the input's syntax.
*/

module COMPILER {
    export class Parser {

        // Block $
        public static parseProgram(tokens): void {
            _CurrentToken = this.getNextToken();
            this.parseBlock();
            this.parseEOF();
        }

        // { StatementList }
        public static parseBlock(): void {
            if (_CurrentToken.getType() === T_LBRACE) {
                _CurrentToken = this.getNextToken();
                this.parseStatementList();

                if (_CurrentToken.getType() === T_RBRACE) {
                    _CurrentToken = this.getNextToken();
                } else {
                    console.log('expecting a right brace');
                }
            } else {
                _Errors++;
                var log = {
                    status: null,
                    msg: null
                };

                log.status = LOG_ERROR;
                log.msg = 'Expected \'\{\'';
                Main.addLog(log);
            }
        }

        // Statement StatementList
        // epsilon
        public static parseStatementList(): void {
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
        }

        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        public static parseStatement(): void {
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
                    Main.addLog(log);
                    break;
            }
        }

        // print ( Expr )
        public static parsePrintStatement(): void {
            console.log('parsePrintStatement()');
            if (_CurrentToken.getType() === T_PRINT) {
                _CurrentToken = this.getNextToken();
                console.log(_CurrentToken);


                if (_CurrentToken.getType() === T_LPAREN) {
                    _CurrentToken = this.getNextToken();
                    this.parseExpr();
                    console.log(_CurrentToken);

                    if (_CurrentToken.getType() === T_RPAREN) {
                        _CurrentToken = this.getNextToken();
                    } else {
                        console.log('print statement parse error');
                    }
                } else {
                    console.log('print statement parse error');
                }
            }
        }

        // Id = Expr
        public static parseAssignmentStatement(): void {
            console.log('parseAssignmentStatement()');
            this.parseId();

            if (_CurrentToken.getType() === T_ASSIGN) {
                _CurrentToken = this.getNextToken();
                this.parseExpr();
            } else {
                console.log('assignment parse error');
            }
        }

        // type Id
        public static parseVarDecl(): void {
            console.log('parseVarDecl()');
            this.parseType();
            this.parseId();
        }

        // while BooleanExpr Block
        public static parseWhileStatement(): void {
            if (_CurrentToken.getType() === T_WHILE) {
                _CurrentToken = this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                console.log('error parsing while statement');
            }
        }

        // if BooleanExpr block
        public static parseIfStatement(): void {
            if (_CurrentToken.getType() === T_IF) {
                _CurrentToken = this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                console.log('error parsing if statement');
            }
        }

        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        public static parseExpr(): void {
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
        }

        // digit intop Expr
        // digit
        public static parseIntExpr(): void {
            console.log('parseIntExpr()');

            if (_CurrentToken.getType() === T_DIGIT) {
                _CurrentToken = this.getNextToken();

                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    // Grab the next token and verify for a digit
                    _CurrentToken = this.getNextToken();
                    this.parseExpr();
                }
            } else {
                console.log('not a digit: ' + _CurrentToken.getValue());
            }
        }

        // TODO: " CharList "
        public static parseStringExpr(): void {

            if (_CurrentToken.getType() === T_QUOTE) {
                this.parseCharList();

                _CurrentToken = this.getNextToken();
                if (_CurrentToken.getType() !== T_QUOTE) {
                    console.log('parseStringExpr error: expected a quote');
                }
            }
        }

        // ( Expr boolop Expr )
        // boolval
        public static parseBooleanExpr(): void {
            console.log('parseBooleanExpr()');
            if (_CurrentToken.getType() === T_LPAREN) {
                _CurrentToken = this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();

                if (_CurrentToken.getType() === T_RPAREN) {
                    _CurrentToken = this.getNextToken();
                }
            } else {
                console.log('expected (');
            }

            

        }

        // char
        public static parseId(): void {
            console.log('parseId()');
            if (_CurrentToken.getType() !== T_ID) {
                console.log('parseid error');
            } else {
                _CurrentToken = this.getNextToken();
            }
        }

        // TODO
        // char CharList
        // space CharList
        // epsilon
        public static parseCharList(): void {
            _CurrentToken = this.getNextToken();

            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    this.parseCharList();
                    break;
                default:
                    break;
            }
        }

        // int | string | boolean
        public static parseType(): void {
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
        }

        // TODO
        // == | !=
        public static parseBoolOp(): void {
            console.log('parseBoolOp()');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                _CurrentToken = this.getNextToken();
            } else {
                console.log('expected boolean operator in parsebooleanexpr()');
            }
        }

        // TODO
        // +
        public static parseIntOp(): void {

        }

        // $
        public static parseEOF(): void {
            console.log('parseEOF()');

            if (_CurrentToken.getType() === T_EOF) {
                console.log('found the EOF!');
            } else {
                console.log('expected $');
            }
        }

        public static getNextToken(): any {
            return _Tokens.shift();
        }
    }
}