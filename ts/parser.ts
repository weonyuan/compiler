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
            this.parseBlock();
            this.parseEOF();
        }

        // { StatementList }
        public static parseBlock(): void {
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() === T_LBRACE) {
                this.parseStatementList();

                if (_CurrentToken.getType() !== T_RBRACE) {
                    console.log('error');
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
        }

        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        public static parseStatement(): void {
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
                } else {
                    console.log('print statement parse error');
                }
            }
        }

        // Id = Expr
        public static parseAssignmentStatement(): void {
            this.parseId();

            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);

            if (_CurrentToken === T_ASSIGN) {
                this.parseExpr();
            } else {
                console.log('assignment parse error');
            }
        }

        // type Id
        public static parseVarDecl(): void {
            this.parseType();
            this.parseId();
        }

        // while BooleanExpr Block
        public static parseWhileStatement(): void {
            this.parseBooleanExpr();
            this.parseBlock();
        }

        // if BooleanExpr block
        public static parseIfStatement(): void {
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);


            if (_CurrentToken.getType() === T_LPAREN) {
                this.parseBooleanExpr();

                this.parseBlock();
            } else {
                console.log('expected ( in if statement');
            }
        }

        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        public static parseExpr(): void {
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
        }

        // digit intop Expr
        // digit
        public static parseIntExpr(): void {
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
            } else {
                console.log('not a digit: ' + _CurrentToken.getValue());
            }
        }

        // " CharList "
        public static parseStringExpr(): void {

        }

        // ( Expr boolop Expr )
        // boolval
        public static parseBooleanExpr(): void {
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
            } else {
                console.log('expected boolean operator in parsebooleanexpr()');
            }

        }

        // char
        public static parseId(): void {
            _CurrentToken = this.getNextToken();
            console.log(_CurrentToken);
            if (_CurrentToken.getType() !== T_ID) {
                console.log('error');
            }
        }

        // char CharList
        // space CharList
        // epsilon
        public static parseCharList(): void {

        }

        // int | string | boolean
        public static parseType(): void {

        }

        // == | !=
        public static parseBoolOp(): void {

        }

        // +
        public static parseIntOp(): void {

        }

        // $
        public static parseEOF(): void {
            _CurrentToken = this.getNextToken();

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