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
            Main.addLog(LOG_VERBOSE, 'Initializing verbose mode!');

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
            Main.addLog(LOG_VERBOSE, 'Expecting a left brace.');

            if (_CurrentToken.getType() === T_LBRACE) {
                Main.addLog(LOG_VERBOSE, 'Received a left brace!');
                this.getNextToken();
                this.parseStatementList();
                Main.addLog(LOG_VERBOSE, 'Expecting a right brace.');

                if (_CurrentToken.getType() === T_RBRACE) {
                    Main.addLog(LOG_VERBOSE, 'Received a right brace!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a print.');
            if (_CurrentToken.getType() === T_PRINT) {
                Main.addLog(LOG_VERBOSE, 'Received a print!');
                this.getNextToken();
                Main.addLog(LOG_VERBOSE, 'Expecting a left parenthese.');

                if (_CurrentToken.getType() === T_LPAREN) {
                    Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                    this.getNextToken();
                    this.parseExpr();
                    Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');

                    if (_CurrentToken.getType() === T_RPAREN) {
                        Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting an equal sign.');

            if (_CurrentToken.getType() === T_ASSIGN) {
                Main.addLog(LOG_VERBOSE, 'Received an equal sign!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a while.');

            if (_CurrentToken.getType() === T_WHILE) {
                Main.addLog(LOG_VERBOSE, 'Received a while!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting an if.');

            if (_CurrentToken.getType() === T_IF) {
                Main.addLog(LOG_VERBOSE, 'Received an if!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a digit.');

            if (_CurrentToken.getType() === T_DIGIT) {
                Main.addLog(LOG_VERBOSE, 'Received a digit!');
                this.getNextToken();
                Main.addLog(LOG_VERBOSE, 'Expecting a plus sign.');

                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    Main.addLog(LOG_VERBOSE, 'Received a plus sign!');

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
            Main.addLog(LOG_VERBOSE, 'Expecting a quote.');

            if (_CurrentToken.getType() === T_QUOTE) {
                Main.addLog(LOG_VERBOSE, 'Received a quote!');
                this.getNextToken();

                this.parseCharList();
                Main.addLog(LOG_VERBOSE, 'Expecting a quote.');

                if (_CurrentToken.getType() === T_QUOTE) {
                    Main.addLog(LOG_VERBOSE, 'Received a quote!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting either a left parenthese or a boolean.');

            if (_CurrentToken.getType() === T_LPAREN) {
                Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');

                if (_CurrentToken.getType() === T_RPAREN) {
                    Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                    this.getNextToken();
                }
            } else if (   _CurrentToken.getType() === T_TRUE
                       || _CurrentToken.getType() === T_FALSE) {
                Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                this.getNextToken();
            } else {
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': ' + _CurrentToken.getName() + ' is not a valid boolean expression.');
            }
        }

        // char
        public static parseId(): void {
            // console.log('parseId()');
            Main.addLog(LOG_VERBOSE, 'Expecting an id.');

            if (_CurrentToken.getType() === T_ID) {
                Main.addLog(LOG_VERBOSE, 'Received an id!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a character.');

            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    Main.addLog(LOG_VERBOSE, 'Received a character!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a valid data type.');

            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
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
            Main.addLog(LOG_VERBOSE, 'Expecting a boolean operator.');

            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                Main.addLog(LOG_VERBOSE, 'Received a boolean operator!');
                this.getNextToken();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }
        }

        // $
        public static parseEOP(): void {
            // console.log('parseEOP()');
            Main.addLog(LOG_VERBOSE, 'Expecting an end of program character.');

            if (_CurrentToken.getType() === T_EOP) {
                Main.addLog(LOG_VERBOSE, 'Received an end of program character!');
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
            Main.addLog(LOG_INFO, 'Parsing complete. Parser found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _Warnings = 0;
            _Errors = 0;
        }
    }
}