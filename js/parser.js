///<reference path="tree.ts" />
///<reference path="token.ts" />
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
            // Reset the warnings and errors
            _Warnings = 0;
            _Errors = 0;
            this.tempToken = null;
            this.cst = new COMPILER.Tree();
            this.ast = new COMPILER.Tree();
            COMPILER.Main.addLog(LOG_INFO, 'Performing parsing.');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Initializing verbose mode!');
            // Load up the first token and let's get parsing!
            this.getNextToken();
            _PreviousToken = _CurrentToken;
            this.parseProgram();
            if (_Errors === 0) {
                this.printResults();
            }
        };
        // Block $
        Parser.parseProgram = function () {
            // console.log('parseProgram()');
            this.cst.addNode('Program', BRANCH_NODE, '');
            this.parseBlock();
            this.parseEOP();
        };
        // { StatementList }
        Parser.parseBlock = function () {
            // console.log('parseBlock()');
            this.cst.addNode('Block', BRANCH_NODE, '');
            this.ast.addNode('Block', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a left brace.');
            if (_CurrentToken.getType() === T_LBRACE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left brace!');
                this.cst.addNode('{', LEAF_NODE, _CurrentToken);
                this.getNextToken();
                this.parseStatementList();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right brace.');
                if (_CurrentToken.getType() === T_RBRACE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right brace!');
                    this.cst.addNode('}', LEAF_NODE, _CurrentToken);
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
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // Statement StatementList
        // epsilon
        Parser.parseStatementList = function () {
            // console.log('parseStatementList()');
            this.cst.addNode('Statement List', BRANCH_NODE, '');
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
        };
        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        Parser.parseStatement = function () {
            // console.log('parseStatement()');
            this.cst.addNode('Statement', BRANCH_NODE, '');
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
            this.cst.levelUp();
        };
        // print ( Expr )
        Parser.parsePrintStatement = function () {
            // console.log('parsePrintStatement()');
            this.cst.addNode('Print Statement', BRANCH_NODE, '');
            this.ast.addNode('Print Statement', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a print.');
            if (_CurrentToken.getType() === T_PRINT) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a print!');
                this.cst.addNode('print', LEAF_NODE, _CurrentToken);
                this.getNextToken();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a left parenthese.');
                if (_CurrentToken.getType() === T_LPAREN) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                    this.cst.addNode('(', LEAF_NODE, _CurrentToken);
                    this.getNextToken();
                    this.parseExpr();
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');
                    if (_CurrentToken.getType() === T_RPAREN) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                        this.cst.addNode(')', LEAF_NODE, _CurrentToken);
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
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // Id = Expr
        Parser.parseAssignmentStatement = function () {
            // console.log('parseAssignmentStatement()');
            this.cst.addNode('Assignment Statement', BRANCH_NODE, '');
            this.ast.addNode('Assignment Statement', BRANCH_NODE, '');
            this.parseId();
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an equal sign.');
            if (_CurrentToken.getType() === T_ASSIGN) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an equal sign!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                this.getNextToken();
                this.parseExpr();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_ASSIGN but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // type Id
        Parser.parseVarDecl = function () {
            // console.log('parseVarDecl()');
            this.cst.addNode('Var Declaration', BRANCH_NODE, '');
            this.ast.addNode('Var Declaration', BRANCH_NODE, '');
            this.parseType();
            this.parseId();
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            // console.log('parseWhileStatement()');
            this.cst.addNode('While Statement', BRANCH_NODE, '');
            this.ast.addNode('While Statement', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a while.');
            if (_CurrentToken.getType() === T_WHILE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a while!');
                this.cst.addNode('while', LEAF_NODE, _CurrentToken);
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_WHILE but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // if BooleanExpr block
        Parser.parseIfStatement = function () {
            // console.log('parseIfStatement()');
            this.cst.addNode('If Statement', BRANCH_NODE, '');
            this.ast.addNode('If Statement', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an if.');
            if (_CurrentToken.getType() === T_IF) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an if!');
                this.cst.addNode('if', LEAF_NODE, _CurrentToken);
                this.getNextToken();
                this.parseBooleanExpr();
                this.parseBlock();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_IF but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
            this.ast.levelUp();
        };
        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        Parser.parseExpr = function () {
            // console.log('parseExpr()');
            this.cst.addNode('Expression', BRANCH_NODE, '');
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
            this.cst.levelUp();
        };
        // digit intop Expr
        // digit
        Parser.parseIntExpr = function () {
            // console.log('parseIntExpr()');
            var tempToken;
            this.cst.addNode('Integer Expression', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a digit.');
            if (_CurrentToken.getType() === T_DIGIT) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a digit!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                tempToken = _CurrentToken;
                this.getNextToken();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a plus sign.');
                // Check to see if the new token is + operator
                if (_CurrentToken.getType() === T_ADD) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a plus sign!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                    this.ast.addNode('Add', BRANCH_NODE, _CurrentToken);
                    this.ast.addNode(tempToken.getValue(), LEAF_NODE, tempToken);
                    // Grab the next token and verify for a digit
                    this.getNextToken();
                    this.parseExpr();
                }
                else {
                    this.ast.addNode(tempToken.getValue(), LEAF_NODE, tempToken);
                }
            }
            else {
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_DIGIT but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
        };
        // " CharList "
        Parser.parseStringExpr = function () {
            // console.log('parseStringExpr()');
            this.cst.addNode('String Expression', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a quote.');
            if (_CurrentToken.getType() === T_QUOTE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a quote!');
                this.cst.addNode('"', LEAF_NODE, _CurrentToken);
                this.getNextToken();
                this.parseCharList();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a quote.');
                if (_CurrentToken.getType() === T_QUOTE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a quote!');
                    this.cst.addNode('"', LEAF_NODE, _CurrentToken);
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
            this.cst.levelUp();
        };
        // ( Expr boolop Expr )
        // boolval
        Parser.parseBooleanExpr = function () {
            // console.log('parseBooleanExpr()');
            this.cst.addNode('Boolean Expression', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting either a left parenthese or a boolean.');
            if (_CurrentToken.getType() === T_LPAREN) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a left parenthese!');
                this.cst.addNode('(', LEAF_NODE, _CurrentToken);
                this.currentLayer++;
                console.log(this.currentLayer);
                this.getNextToken();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                this.ast.levelUp();
                COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a right parenthese.');
                if (_CurrentToken.getType() === T_RPAREN) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a right parenthese!');
                    this.cst.addNode(')', LEAF_NODE, _CurrentToken);
                    this.currentLayer--;
                    this.getNextToken();
                }
                this.boolOpExists = false;
            }
            else {
                if (_CurrentToken.getType() === T_TRUE
                    || _CurrentToken.getType() === T_FALSE) {
                    this.tempToken = _CurrentToken;
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                    if (_PreviousToken.getType() !== T_LPAREN) {
                        this.ast.addNode(this.tempToken.getValue(), LEAF_NODE, this.tempToken);
                    }
                    this.getNextToken();
                }
                else {
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': ' + _CurrentToken.getName() + ' is not a valid boolean expression.');
                }
            }
            this.cst.levelUp();
        };
        // char
        Parser.parseId = function () {
            // console.log('parseId()');
            this.cst.addNode('Id', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an id.');
            if (_CurrentToken.getType() === T_ID) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an id!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                this.ast.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                this.getNextToken();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected T_ID but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
        };
        // char CharList
        // space CharList
        // epsilon
        Parser.parseCharList = function () {
            // console.log('parseCharList()');
            this.cst.addNode('CharList', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a character.');
            switch (_CurrentToken.getType()) {
                case T_CHAR:
                case T_WHITESPACE:
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a character!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                    this.buffer += _CurrentToken.getValue();
                    this.getNextToken();
                    this.parseCharList();
                    break;
                default:
                    this.ast.addNode(this.buffer, LEAF_NODE, _CurrentToken);
                    this.buffer = '';
                    break;
            }
            this.cst.levelUp();
        };
        // int | string | boolean
        Parser.parseType = function () {
            // console.log('parseType()');
            this.cst.addNode('Type', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a valid data type.');
            switch (_CurrentToken.getType()) {
                case T_INT:
                case T_STRING:
                case T_BOOLEAN:
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Received a ' + _CurrentToken.getValue() + '!');
                    this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                    this.ast.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                    this.getNextToken();
                    break;
                default:
                    _Errors++;
                    COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                        ': Expected T_TYPE but received ' + _CurrentToken.getName() + '.');
                    break;
            }
            this.cst.levelUp();
        };
        // == | !=
        Parser.parseBoolOp = function () {
            // console.log('parseBoolOp()');
            this.cst.addNode('Boolean Operator', BRANCH_NODE, '');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting a boolean operator.');
            if (_CurrentToken.getType() === T_EQUAL || _CurrentToken.getType() === T_NOTEQUAL) {
                this.boolOpExists = true;
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received a boolean operator!');
                this.cst.addNode(_CurrentToken.getValue(), LEAF_NODE, _CurrentToken);
                if (_CurrentToken.getType() === T_EQUAL) {
                    this.ast.addNode('CompareEqual', BRANCH_NODE, _CurrentToken);
                }
                else if (_CurrentToken.getType() === T_NOTEQUAL) {
                    this.ast.addNode('CompareNotEqual', BRANCH_NODE, _CurrentToken);
                }
                this.ast.addNode(this.tempToken.getValue(), LEAF_NODE, this.tempToken);
                this.getNextToken();
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Line ' + _PreviousToken.getLineNum() +
                    ': Expected a valid boolean operator but received ' + _CurrentToken.getName() + '.');
            }
            this.cst.levelUp();
        };
        // $
        Parser.parseEOP = function () {
            // console.log('parseEOP()');
            COMPILER.Main.addLog(LOG_VERBOSE, 'Expecting an end of program character.');
            if (_CurrentToken.getType() === T_EOP) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Received an end of program character!');
                this.cst.addNode('$', LEAF_NODE, _CurrentToken);
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
            this.cst.printTreeString('cst');
            _CST = this.cst;
            _AST = this.ast;
        };
        Parser.buffer = '';
        Parser.tempToken = null;
        Parser.currentLayer = 0;
        Parser.boolOpExists = false;
        Parser.bufferArray = [];
        return Parser;
    })();
    COMPILER.Parser = Parser;
})(COMPILER || (COMPILER = {}));
