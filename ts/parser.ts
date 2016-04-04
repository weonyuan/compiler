///<reference path="tree.ts" />
///<reference path="token.ts" />
///<reference path="globals.ts" />
/*
    parser.ts

    Responsible for receiving the tokens from lexer
    and validating the input's syntax.
*/

module COMPILER {
    export class Parser {
        private static cst: Tree;
        private static ast: Tree;

        public static init(tokens): any {
            this.cst = new Tree();
            this.ast = new Tree();

            Main.addLog(LOG_INFO, 'Performing parsing.');
            Main.addLog(LOG_VERBOSE, 'Initializing verbose mode!');

            // Load up the first token and let's get parsing!
            this.getNextToken();
            _PreviousToken = _CurrentToken;
            this.parseProgram();

            return this.cst;
        }

        // Block $
        public static parseProgram(): void {
            // console.log('parseProgram()');
            this.cst.addNode('Program', BRANCH_NODE);

            this.parseBlock();
            this.parseEOP();
        }

        // { StatementList }
        public static parseBlock(): void {
            // console.log('parseBlock()');
            this.cst.addNode('Block', BRANCH_NODE);
            this.ast.addNode('Block', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting a left brace.');

            if (_CurrentToken.getType() === T_LBRACE) {
                Main.addLog(LOG_VERBOSE, 'Received a left brace!');
                this.cst.addNode('{', LEAF_NODE);

                this.getNextToken();
                this.parseStatementList();
                Main.addLog(LOG_VERBOSE, 'Expecting a right brace.');

                if (_CurrentToken.getType() === T_RBRACE) {
                    Main.addLog(LOG_VERBOSE, 'Received a right brace!');
                    this.cst.addNode('}', LEAF_NODE);

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

            this.cst.levelUp();
        }

        // Statement StatementList
        // epsilon
        public static parseStatementList(): void {
            // console.log('parseStatementList()');
            this.cst.addNode('Statement List', BRANCH_NODE);

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

            this.cst.levelUp();
        }

        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        public static parseStatement(): void {
            // console.log('parseStatement()');
            this.cst.addNode('Statement', BRANCH_NODE);

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

            this.cst.levelUp();
        }

        // print ( Expr )
        public static parsePrintStatement(): void {
            // console.log('parsePrintStatement()');
            this.cst.addNode('Print Statement', BRANCH_NODE);
            this.ast.addNode('Print Statement', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting a print.');
            if (_CurrentToken.getType() === T_PRINT) {
                Main.addLog(LOG_VERBOSE, 'Received a print!');
                this.cst.addNode('print', LEAF_NODE);

                this.getNextToken();
                Main.addLog(LOG_VERBOSE, 'Expecting a left parenthese.');

                if (_CurrentToken.getType() === T_LPAREN) {
                    Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                    this.cst.addNode('(', LEAF_NODE);

                    this.getNextToken();
                    this.parseExpr();
                    Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');

                    if (_CurrentToken.getType() === T_RPAREN) {
                        Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                        this.cst.addNode(')', LEAF_NODE);

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

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // Id = Expr
        public static parseAssignmentStatement(): void {
            // console.log('parseAssignmentStatement()');
            this.cst.addNode('Assignment Statement', BRANCH_NODE);
            this.ast.addNode('Assignment Statement', BRANCH_NODE);

            this.parseId();
            Main.addLog(LOG_VERBOSE, 'Expecting an equal sign.');

            if (_CurrentToken.getType() === T_ASSIGN) {
                Main.addLog(LOG_VERBOSE, 'Received an equal sign!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);

                this.getNextToken();
                this.parseExpr();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_ASSIGN but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // type Id
        public static parseVarDecl(): void {
            // console.log('parseVarDecl()');
            this.cst.addNode('Var Declaration', BRANCH_NODE);
            this.ast.addNode('Var Declaration', BRANCH_NODE);

            this.parseType();
            this.parseId();

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // while BooleanExpr Block
        public static parseWhileStatement(): void {
            // console.log('parseWhileStatement()');
            this.cst.addNode('While Statement', BRANCH_NODE);
            this.ast.addNode('While Statement', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting a while.');

            if (_CurrentToken.getType() === T_WHILE) {
                Main.addLog(LOG_VERBOSE, 'Received a while!');
                this.cst.addNode('while', LEAF_NODE);

                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_WHILE but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // if BooleanExpr block
        public static parseIfStatement(): void {
            // console.log('parseIfStatement()');
            this.cst.addNode('If Statement', BRANCH_NODE);
            this.ast.addNode('If Statement', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting an if.');

            if (_CurrentToken.getType() === T_IF) {
                Main.addLog(LOG_VERBOSE, 'Received an if!');
                this.cst.addNode('if', LEAF_NODE);

                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_IF but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        public static parseExpr(): void {
            // console.log('parseExpr()');
            this.cst.addNode('Expression', BRANCH_NODE);

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

            this.cst.levelUp();
        }

        // digit intop Expr
        // digit
        public static parseIntExpr(): void {
            // console.log('parseIntExpr()');
            var tempToken: Token;
            this.cst.addNode('Integer Expression', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting a digit.');

            if (_CurrentToken.getType() === T_DIGIT) {
                Main.addLog(LOG_VERBOSE, 'Received a digit!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                tempToken = _CurrentToken;

                this.getNextToken();
                Main.addLog(LOG_VERBOSE, 'Expecting a plus sign.');

                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    Main.addLog(LOG_VERBOSE, 'Received a plus sign!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                    this.ast.addNode('Addition', BRANCH_NODE);
                    this.ast.addNode(tempToken.getValue(), LEAF_NODE);

                    // Grab the next token and verify for a digit
                    this.getNextToken();
                    this.parseExpr();
                } else {
                    this.ast.addNode(tempToken.getValue(), LEAF_NODE);
                }
            } else {
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected T_DIGIT but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
            this.ast.levelUp();
        }

        // " CharList "
        public static parseStringExpr(): void {
            // console.log('parseStringExpr()');
            this.cst.addNode('String Expression', BRANCH_NODE);
            Main.addLog(LOG_VERBOSE, 'Expecting a quote.');

            if (_CurrentToken.getType() === T_QUOTE) {
                Main.addLog(LOG_VERBOSE, 'Received a quote!');
                this.cst.addNode('"', LEAF_NODE);
                this.getNextToken();

                this.parseCharList();
                Main.addLog(LOG_VERBOSE, 'Expecting a quote.');

                if (_CurrentToken.getType() === T_QUOTE) {
                    Main.addLog(LOG_VERBOSE, 'Received a quote!');
                    this.cst.addNode('"', LEAF_NODE);
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

            this.cst.levelUp();
        }

        // ( Expr boolop Expr )
        // boolval
        public static parseBooleanExpr(): void {
            // console.log('parseBooleanExpr()');
            this.cst.addNode('Boolean Expression', BRANCH_NODE);
            Main.addLog(LOG_VERBOSE, 'Expecting either a left parenthese or a boolean.');

            if (_CurrentToken.getType() === T_LPAREN) {
                Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                this.cst.addNode('(', LEAF_NODE);
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');

                if (_CurrentToken.getType() === T_RPAREN) {
                    Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                    this.cst.addNode(')', LEAF_NODE);
                    this.getNextToken();
                }
            } else if (   _CurrentToken.getType() === T_TRUE
                       || _CurrentToken.getType() === T_FALSE) {
                Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                this.getNextToken();
            } else {
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': ' + _CurrentToken.getName() + ' is not a valid boolean expression.');
            }

            this.cst.levelUp();
        }

        // char
        public static parseId(): void {
            // console.log('parseId()');
            this.cst.addNode('Id', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting an id.');

            if (_CurrentToken.getType() === T_ID) {
                Main.addLog(LOG_VERBOSE, 'Received an id!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                this.ast.addNode(_CurrentToken.getValue(), LEAF_NODE);

                this.getNextToken();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() + 
                                       ': Expected T_ID but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
        }

        // char CharList
        // space CharList
        // epsilon
        public static parseCharList(): void {
            // console.log('parseCharList()');
            this.cst.addNode('CharList', BRANCH_NODE);
            Main.addLog(LOG_VERBOSE, 'Expecting a character.');

            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    Main.addLog(LOG_VERBOSE, 'Received a character!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);

                    this.getNextToken();
                    this.parseCharList();
                    break;
                default:
                    // epsilon
                    break;
            }

            this.cst.levelUp();
        }

        // int | string | boolean
        public static parseType(): void {
            // console.log('parseType()');
            this.cst.addNode('Type', BRANCH_NODE);

            Main.addLog(LOG_VERBOSE, 'Expecting a valid data type.');

            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                    this.ast.addNode(_CurrentToken.getValue(), LEAF_NODE);

                    this.getNextToken();
                    break;
                default:
                    _Errors++;
                    Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                           ': Expected T_TYPE but received ' + _CurrentToken.getName() + '.');
                    break;
            }

            this.cst.levelUp();
        }

        // == | !=
        public static parseBoolOp(): void {
            // console.log('parseBoolOp()');
            this.cst.addNode('Boolean Operator', BRANCH_NODE);
            Main.addLog(LOG_VERBOSE, 'Expecting a boolean operator.');

            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                Main.addLog(LOG_VERBOSE, 'Received a boolean operator!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE);
                this.getNextToken();
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                                       ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }

            this.cst.levelUp();
        }

        // $
        public static parseEOP(): void {
            // console.log('parseEOP()');
            Main.addLog(LOG_VERBOSE, 'Expecting an end of program character.');

            if (_CurrentToken.getType() === T_EOP) {
                Main.addLog(LOG_VERBOSE, 'Received an end of program character!');
                this.cst.addNode('$', LEAF_NODE);
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
            this.cst.printTreeString('cst');
            // This is temporary. WE SHOULD DISPLAY THE AST AFTER SEMANTIC ANALYSIS
            this.ast.printTreeString('ast');

            // Reset the warnings and errors for the next process
            _Warnings = 0;
            _Errors = 0;
        }
    }
}