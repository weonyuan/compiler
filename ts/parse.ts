module COMPILER {
    export class Parse {

        // Block $
        public static parseProgram(): void {
            this.parseBlock();
            this.parseEOF();
        }

        // { StatementList }
        public static parseBlock(): void {
            this.parseStatementList();
        }

        // Statement StatementList
        // epsilon
        public static parseStatementList(): void {
            this.parseStatement();
            this.parseStatementList();
        }

        // PrintStatement
        // AssignmentStatement
        // VarDecl
        // WhileStatement
        // IfStatement
        // Block
        public static parseStatement(): void {
            this.parsePrintStatement();
            this.parseAssignmentStatement();
            this.parseVarDecl();
            this.parseWhileStatement();
            this.parseIfStatement();
            this.parseBlock();
        }

        // print ( Expr )
        public static parsePrintStatement(): void {
            this.parseExpr();
        }

        // Id = Expr
        public static parseAssignmentStatement(): void {
            this.parseId();
            this.parseExpr();
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
            this.parseBooleanExpr();
            this.parseBlock();
        }

        // IntExpr
        // StringExpr
        // BooleanExpr
        // Id
        public static parseExpr(): void {
            
        }

        // digit intop Expr
        // digit
        public static parseIntExpr(): void {

        }

        // " CharList "
        public static parseStringExpr(): void {

        }

        // ( Expr boolop Expr )
        // boolval
        public static parseBooleanExpr(): void {

        }

        // char
        public static parseId(): void {

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

        }
    }
}