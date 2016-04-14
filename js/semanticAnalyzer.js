///<reference path="tree.ts" />
///<reference path="symbolTable.ts" />
///<reference path="globals.ts" />
/*
    semanticAnalyzer.ts

    Responsible for checking the scope and type
    of the CST.
*/
var COMPILER;
(function (COMPILER) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        SemanticAnalyzer.init = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Performing semantic analysis.');
            this.generateAST();
            this.scopeCheck(_CST.root, this.currentScope);
            this.typeCheck(_CST.root);
            this.printResults();
            return this.currentScope;
        };
        SemanticAnalyzer.generateAST = function () {
            console.log(_AST);
        };
        SemanticAnalyzer.scopeCheck = function (node, symbolTable) {
            if (node.name !== null || node.name !== undefined) {
                console.log(node.name);
                var newScope = false;
                switch (node.name) {
                    case 'Block':
                        if (node.parent.name !== 'Program') {
                            newScope = true;
                            this.openScope();
                        }
                        break;
                    case 'Var Declaration':
                        var varName = node.children[1].children[0].name;
                        var lineNum = node.children[1].children[0].lineNum;
                        var dataType = node.children[0].children[0].name;
                        var id = symbolTable.insertEntry(varName, dataType, lineNum);
                        COMPILER.Main.addSymbol(id, varName, dataType, lineNum, this.currentScope.scopeNum);
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
        };
        SemanticAnalyzer.typeCheck = function (node) {
        };
        SemanticAnalyzer.openScope = function () {
            var newScope = new COMPILER.SymbolTable();
            newScope.setParent(this.currentScope);
            newScope.setScopeNum(this.nextScopeNum++);
            this.currentScope.addChild(newScope);
        };
        SemanticAnalyzer.closeScope = function () {
            if (this.currentScope.parent !== null) {
                this.currentScope = this.currentScope.parent;
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Attempted to access a nonexistant parent scope.');
            }
        };
        SemanticAnalyzer.printResults = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Semantic analysis complete. Analyzer found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            _AST.printTreeString('ast');
            // Reset the warnings and errors for the next process
            _Warnings = 0;
            _Errors = 0;
        };
        SemanticAnalyzer.currentScope = new COMPILER.SymbolTable();
        SemanticAnalyzer.nextScopeNum = 1;
        return SemanticAnalyzer;
    })();
    COMPILER.SemanticAnalyzer = SemanticAnalyzer;
})(COMPILER || (COMPILER = {}));
