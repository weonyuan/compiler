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
            this.nextScopeNum = 1;
            COMPILER.Main.addLog(LOG_INFO, 'Performing semantic analysis.');
            this.generateAST();
            this.scopeCheck(_CST.root);
            // this.typeCheck(_CST.root, this.currentScope);
            this.printResults();
            return this.currentScope;
        };
        // TODO
        SemanticAnalyzer.generateAST = function () {
        };
        SemanticAnalyzer.scopeCheck = function (node) {
            if (node.name !== null || node.name !== undefined) {
                var newScope = false;
                switch (node.name) {
                    case 'Block':
                        if (node.parent.name !== 'Program') {
                            newScope = true;
                            this.openScope();
                        }
                        break;
                    case 'Var Declaration':
                        var name = node.children[1].children[0].name;
                        var lineNum = node.children[1].children[0].lineNum;
                        var dataType = node.children[0].children[0].name;
                        var id = this.currentScope.insertEntry(name, dataType, lineNum);
                        // Error: The variable is already declared
                        if (id !== null) {
                            COMPILER.Main.addSymbol(id, name, dataType, lineNum, this.currentScope.getScopeNum());
                        }
                        else {
                            _Errors++;
                            COMPILER.Main.addLog(LOG_ERROR, 'Attempted to declare identifier ' + name +
                                ' on line ' + lineNum + ' which already exists.');
                        }
                        break;
                    case 'Assignment Statement':
                        var name = node.children[0].children[0].name;
                        var lineNum = node.children[0].children[0].lineNum;
                        var entryExists = this.currentScope.checkEntry(name, node, 'Assignment Statement');
                        if (!entryExists) {
                            _Errors++;
                            COMPILER.Main.addLog(LOG_ERROR, 'Identifier ' + name + ' on line ' + lineNum +
                                ' was assigned before being declared.');
                        }
                        break;
                }
                // Traverse through the child nodes
                for (var i = 0; i < node.children.length; i++) {
                    this.scopeCheck(node.children[i]);
                }
                if (newScope) {
                    this.closeScope();
                }
            }
        };
        SemanticAnalyzer.typeCheck = function (node, symbolTable) {
            // We only care if the node is a leaf node
            if (!node.children || node.children.length === 0) {
                console.log('leaf node: ' + node.name);
                // CST: Type -> Var Declaration
                var parentNode = node.parent.parent;
                switch (node.type) {
                    case T_INT:
                    case T_STRING:
                    case T_BOOLEAN:
                        this.establishTypeComparable(parentNode, node.type);
                        break;
                    case T_TRUE:
                    case T_FALSE:
                        this.establishTypeComparable(parentNode, dataTypes.BOOLEAN);
                        break;
                    case T_DIGIT:
                        this.establishTypeComparable(parentNode, dataTypes.INT);
                        break;
                    case T_ID:
                        var hashID = symbolTable.assignHashID(node.name);
                        var type = symbolTable.getEntry(hashID).getType();
                        console.log('var type check');
                        console.log('hashID: ' + hashID + '; type: ' + type);
                        this.establishTypeComparable(parentNode, type);
                        break;
                    default:
                        // epsilon
                        break;
                }
            }
            // Traverse through the child nodes
            for (var i = 0; i < node.children.length; i++) {
                this.typeCheck(node.children[i], symbolTable);
            }
            if (node.children && node.name !== 'Block') {
                var parentNode = node.parent;
                var leftChild = node.children[0];
                var rightChild = node.children[1];
                if (leftChild.type.length !== 0 && rightChild.type.length !== 0) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Determining whether ' + leftChild.type + ' is type compatible ' +
                        'with ' + rightChild.type + ' on line ' + node.children.lineNum + '.');
                    if (leftChild.type === rightChild.type) {
                        if (parentNode.name !== 'Block') {
                            // Left...right...doesn't matter here
                            var propagateType = leftChild.type;
                            if (node.name === '==' || node.name === '!=') {
                                propagateType = dataTypes.BOOLEAN;
                            }
                            this.establishTypeComparable(parentNode, propagateType);
                        }
                    }
                    else {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Type mismatch found on line ' + node.leftChild.lineNum +
                            '. The left side of the expression (' + node.leftChild.name + ':' + node.leftChild.type +
                            ' doesn\'t match up with the right side (' + node.rightChild.name + ':' + node.rightChild.type + '.');
                    }
                }
                else if (leftChild.type.length === 0 && rightChild.type.length !== 0) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Setting the type of ' + node.name + ' on line ' + node.lineNum +
                        ' to ' + rightChild.type);
                }
                else if (leftChild.type.length !== 0 && rightChild.type.length === 0) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Setting the type of ' + node.name + ' on line ' + node.lineNum +
                        ' to ' + leftChild.type);
                }
            }
        };
        SemanticAnalyzer.establishTypeComparable = function (parentNode, childType) {
            // CST: Var Declaration -> Type / Id -> <datatype> / <id>
            if (parentNode.children[0].children[0].type.length === 0) {
                parentNode.children[0].children[0].type = childType;
            }
            else if (parentNode.children[1].children[0].type.length === 0) {
                parentNode.children[1].children[0].type = childType;
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Attempted to establish a type comparable with the ' +
                    'parent node\'s left and right types.');
            }
        };
        SemanticAnalyzer.openScope = function () {
            var newScope = new COMPILER.SymbolTable();
            newScope.setParent(this.currentScope);
            newScope.setScopeNum(this.nextScopeNum++);
            this.currentScope.addChild(newScope);
            this.currentScope = newScope;
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
