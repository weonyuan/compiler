///<reference path="tree.ts" />
///<reference path="symbolTable.ts" />
///<reference path="globals.ts" />
/*
    semanticAnalyzer.ts

    Responsible for checking the scope and type
    of the CST.
*/

module COMPILER {
    export class SemanticAnalyzer {

        public static currentScope: SymbolTable = new SymbolTable();
        public static nextScopeNum: number = 1;

        public static init(): any {
            Main.addLog(LOG_INFO, 'Performing semantic analysis.');

            this.generateAST();
            this.scopeCheck(_CST.root, this.currentScope);
            this.typeCheck(_CST.root);

            this.printResults();

            return this.currentScope;
        }

        public static generateAST(): void {
            console.log(_AST);
        }

        public static scopeCheck(node, symbolTable): void {
            if (node.name !== null || node.name !== undefined) {
                console.log(node.name);
                var newScope: boolean = false;

                switch (node.name) {
                    case 'Block':
                        if (node.parent.name !== 'Program') {
                            newScope = true;
                            this.openScope();
                        }
                        break;
                    case 'Var Declaration':
                        var varName: string = node.children[1].children[0].name;
                        var lineNum: number = node.children[1].children[0].lineNum;

                        var dataType: string = node.children[0].children[0].name;

                        var id: number = symbolTable.insertEntry(varName, dataType, lineNum);
                        Main.addSymbol(id, varName, dataType, lineNum, this.currentScope.scopeNum);
                        break;
                    case 'Assignment Statement':


                        break;
                }

                if (node.type === T_ID) {
                    console.log(node.name);
                }

                // Traverse through the child nodes
                for (var i = 0; i < node.children.length; i++) {
                    this.scopeCheck(node.children[i], symbolTable);
                }

                if (newScope) {
                    this.closeScope();
                }
            }
        }

        public static typeCheck(node): void {

        }

        public static openScope(): void {
            var newScope: SymbolTable = new SymbolTable();
            newScope.setParent(this.currentScope);
            newScope.setScopeNum(this.nextScopeNum++);

            this.currentScope.addChild(newScope);
        }

        public static closeScope(): void {
            if (this.currentScope.parent !== null) {
                this.currentScope = this.currentScope.parent;
            } else {
                _Errors++;
                Main.addLog(LOG_ERROR, 'Attempted to access a nonexistant parent scope.');
            }
        }

        public static printResults(): void {
            Main.addLog(LOG_INFO, 'Semantic analysis complete. Analyzer found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _AST.printTreeString('ast');

            // Reset the warnings and errors for the next process
            _Warnings = 0;
            _Errors = 0;
        }
    }
}