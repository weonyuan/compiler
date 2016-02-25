///<reference path="globals.ts" />
/*
    parser.ts

    Responsible for receiving the tokens from lexer
    and validating the input's syntax.
*/

module COMPILER {
    export class Parser {
        public static init(tokens): void {
            Main.addLog(LOG_INFO, 'Performing parsing.');

            // Load up the first token and let's get parsing!
            this.getNextToken();
            _PreviousToken = _CurrentToken;
            this.parseProgram();
        }

        // Block $
        public static parseProgram(): void {
            // console.log('parseProgram()');
            this.parseBlock();
            this.parseEOP();
        }

        // { StatementList }
        public static parseBlock(): void {
            // console.log('parseBlock()');
            if (_CurrentToken.getType() === T_LBRACE) {
                this.getNextToken();
                this.parseStatementList();

                if (_CurrentToken.getType() === T_RBRACE) {
                    this.getNextToken();
                } else {
                    _Errors++;
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': Expected T_RBRACE but received ' + _CurrentToken.getName() + '.');
                }
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_LBRACE but received ' + _CurrentToken.getName() + '.');
            }
        }

        // Statement StatementList
        // epsilon
        public static parseStatementList(): void {
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
        }

        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        public static parseStatement(): void {
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
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': ' + _CurrentToken.getName() + ' is not a valid statement.');
                    break;
            }
        }

        // print ( Expr )
        public static parsePrintStatement(): void {
            // console.log('parsePrintStatement()');
            if (_CurrentToken.getType() === T_PRINT) {
                this.getNextToken();

                if (_CurrentToken.getType() === T_LPAREN) {
                    this.getNextToken();
                    this.parseExpr();

                    if (_CurrentToken.getType() === T_RPAREN) {
                        this.getNextToken();
                    } else {
                        _Errors++;
                        Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                               ': Expected T_RPAREN but received ' + _CurrentToken.getName() + '.');
                    }
                } else {
                    _Errors++;
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': Expected T_LPAREN but received ' + _CurrentToken.getName() + '.');
                }
            }
        }

        // Id = Expr
        public static parseAssignmentStatement(): void {
            // console.log('parseAssignmentStatement()');
            this.parseId();

            if (_CurrentToken.getType() === T_ASSIGN) {
                this.getNextToken();
                this.parseExpr();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_ASSIGN but received ' + _CurrentToken.getName() + '.');
            }
        }

        // type Id
        public static parseVarDecl(): void {
            // console.log('parseVarDecl()');
            this.parseType();
            this.parseId();
        }

        // while BooleanExpr Block
        public static parseWhileStatement(): void {
            // console.log('parseWhileStatement()');
            if (_CurrentToken.getType() === T_WHILE) {
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_WHILE but received ' + _CurrentToken.getName() + '.');
            }
        }

        // if BooleanExpr block
        public static parseIfStatement(): void {
            // console.log('parseIfStatement()');
            if (_CurrentToken.getType() === T_IF) {
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_IF but received ' + _CurrentToken.getName() + '.');
            }
        }

        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        public static parseExpr(): void {
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
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': ' + _CurrentToken.getName() + ' is not a valid expression.');
                    break;
            }
        }

        // digit intop Expr
        // digit
        public static parseIntExpr(): void {
            // console.log('parseIntExpr()');
            if (_CurrentToken.getType() === T_DIGIT) {
                this.getNextToken();

                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    // Grab the next token and verify for a digit
                    this.getNextToken();
                    this.parseExpr();
                }
            } else {
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_DIGIT but received ' + _CurrentToken.getName() + '.');
            }
        }

        // " CharList "
        public static parseStringExpr(): void {
            // console.log('parseStringExpr()');
            if (_CurrentToken.getType() === T_QUOTE) {
                this.getNextToken();

                this.parseCharList();
                if (_CurrentToken.getType() === T_QUOTE) {
                    this.getNextToken();
                } else {
                    _Errors++;
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': Expected T_QUOTE but received ' + _CurrentToken.getName() + '.');
                }
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_QUOTE but received ' + _CurrentToken.getName() + '.');
            }
        }

        // ( Expr boolop Expr )
        // boolval
        public static parseBooleanExpr(): void {
            // console.log('parseBooleanExpr()');
            if (_CurrentToken.getType() === T_LPAREN) {
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();

                if (_CurrentToken.getType() === T_RPAREN) {
                    this.getNextToken();
                }
            } else if (   _CurrentToken.getType() === T_TRUE
                       || _CurrentToken.getType() === T_FALSE) {
                this.getNextToken();
            } else {
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': ' + _CurrentToken.getName() + ' is not a valid boolean expression.');
            }
        }

        // char
        public static parseId(): void {
            // console.log('parseId()');
            if (_CurrentToken.getType() === T_ID) {
                this.getNextToken();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() + 
                                       ': Expected T_ID but received ' + _CurrentToken.getName() + '.');
            }
        }

        // char CharList
        // space CharList
        // epsilon
        public static parseCharList(): void {
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
        }

        // int | string | boolean
        public static parseType(): void {
            // console.log('parseType()');
            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    this.getNextToken();
                    break;
                default:
                    _Errors++;
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': Expected T_TYPE but received ' + _CurrentToken.getName() + '.');
                    break;
            }
        }

        // == | !=
        public static parseBoolOp(): void {
            // console.log('parseBoolOp()');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                this.getNextToken();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }
        }

        // $
        public static parseEOP(): void {
            // console.log('parseEOF()');
            if (_CurrentToken.getType() === T_EOP) {
                this.getNextToken();

                if (_CurrentToken !== null && _CurrentToken !== undefined) {
                    this.parseProgram();
                }
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_EOP but received ' + _CurrentToken.getName() + '.');
            }
        }

        public static getNextToken(): void {
            _PreviousToken = _CurrentToken;
            _CurrentToken = _Tokens.shift();
        }

        public static printResults(): void {
            Main.addLog(LOG_INFO, 'Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _Warnings = 0;
            _Errors = 0;
        }
    }
}