var COMPILER;
(function (COMPILER) {
    var Parse = (function () {
        function Parse() {
        }
        // Block $
        Parse.parseProgram = function () {
            this.parseBlock();
            this.parseEOF();
        };
        // { StatementList }
        Parse.parseBlock = function () {
            this.parseStatementList();
        };
        // Statement StatementList
        // epsilon
        Parse.parseStatementList = function () {
            this.parseStatement();
            this.parseStatementList();
        };
        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        Parse.parseStatement = function () {
            this.parsePrintStatement();
            this.parseAssignmentStatement();
            this.parseVarDecl();
            this.parseWhileStatement();
            this.parseIfStatement();
            this.parseBlock();
        };
        // print ( Expr )
        Parse.parsePrintStatement = function () {
            this.parseExpr();
        };
        // Id = Expr
        Parse.parseAssignmentStatement = function () {
            this.parseId();
            this.parseExpr();
        };
        // type Id
        Parse.parseVarDecl = function () {
            this.parseType();
            this.parseId();
        };
        // while BooleanExpr Block
        Parse.parseWhileStatement = function () {
            this.parseBooleanExpr();
            this.parseBlock();
        };
        // if BooleanExpr block
        Parse.parseIfStatement = function () {
            this.parseBooleanExpr();
            this.parseBlock();
        };
        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        Parse.parseExpr = function () {
        };
        // digit intop Expr
        // digit
        Parse.parseIntExpr = function () {
        };
        // " CharList "
        Parse.parseStringExpr = function () {
        };
        // ( Expr boolop Expr )
        // boolval
        Parse.parseBooleanExpr = function () {
        };
        // char
        Parse.parseId = function () {
        };
        // char CharList
        // space CharList
        // epsilon
        Parse.parseCharList = function () {
        };
        // int | string | boolean
        Parse.parseType = function () {
        };
        // == | !=
        Parse.parseBoolOp = function () {
        };
        // +
        Parse.parseIntOp = function () {
        };
        // $
        Parse.parseEOF = function () {
        };
        return Parse;
    })();
    COMPILER.Parse = Parse;
})(COMPILER || (COMPILER = {}));
