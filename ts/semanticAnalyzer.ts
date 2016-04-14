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
            this.nextScopeNum = 1;
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
                var newScope: boolean = false;

                switch (node.name) {
                    case 'Block':
                        if (node.parent.name !== 'Program') {
                            newScope = true;
                            this.openScope();
                        }

                        break;
                    case 'Var Declaration':
                        var name: string = node.children[1].children[0].name;
                        var lineNum: number = node.children[1].children[0].lineNum;

                        var dataType: string = node.children[0].children[0].name;

                        var id: number = symbolTable.insertEntry(name, dataType, lineNum);
                        
                        // Error: The variable is already declared
                        if (id !== null) {
                            Main.addSymbol(id, name, dataType, lineNum, this.currentScope.getScopeNum());

                        } else {
                            _Errors++;
                            Main.addLog(LOG_ERROR, 'Attempted to declare identifier ' + name +
                                ' on line ' + lineNum + ' which already exists.');
                        }

                        break;
                    case 'Assignment Statement':
                        var name: string = node.children[0].children[0].name;
                        var lineNum: number = node.children[0].children[0].lineNum;
                        var entryExists: boolean = symbolTable.checkEntry(name, node, 'Assignment Statement');

                        if (!entryExists) {
                            _Errors++;
                            Main.addLog(LOG_ERROR, 'Identifier ' + name + ' on line ' + lineNum +
                                ' was assigned before being declared.');
                        }

                        break;
                    case 'Id':
                        var name: string = node.children[0].name;
                        var lineNum: number = node.children[0].lineNum;
                        var entryExists: boolean = symbolTable.checkEntry(name, node, '');

                        if (!entryExists) {
                            _Errors++;
                            Main.addLog(LOG_ERROR, 'Identifier ' + name + ' on line ' + lineNum +
                                ' was assigned before being declared.');
                        }

                        break;
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
            // We only care if the node is a leaf node
            if (node.children || node.children.length === 0) {
                var parentNode = node.parent;

                switch (node.type) {
                    case T_INT:
                    case T_STRING:
                    case T_BOOLEAN:
                        break;

                    case T_TRUE:
                    case T_FALSE:
                        break;

                    case T_DIGIT:
                        break;

                    case T_ID:
                        break;
                        
                    default:
                        break;
                }
            }

            // Traverse through the child nodes
            for (var i = 0; i < node.children.length; i++) {
                this.typeCheck(node.children[i]);
            }
        }

        public static openScope(): void {
            var newScope: SymbolTable = new SymbolTable();
            newScope.setParent(this.currentScope);
            newScope.setScopeNum(this.nextScopeNum++);

            this.currentScope.addChild(newScope);
            this.currentScope = newScope;
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