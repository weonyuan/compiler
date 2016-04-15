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
            this.currentScope = new COMPILER.SymbolTable();
            this.nextScopeNum = 1;
            COMPILER.Main.addLog(LOG_INFO, 'Performing semantic analysis.');
            this.generateAST();
            this.scopeCheck(_CST.root);
            this.typeCheck(_AST.root);
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
        SemanticAnalyzer.typeCheck = function (node) {
            // We only care if the node is a leaf node
            if (!node.children || node.children.length === 0) {
                console.log('leaf node: ' + node.name);
                // CST: Type -> Var Declaration
                var parentNode = node.parent;
                switch (node.tokenType) {
                    case T_INT:
                    case T_STRING:
                    case T_BOOLEAN:
                        this.establishTypeComparable(parentNode, node.name);
                        node.dataType = node.name;
                        break;
                    case T_TRUE:
                    case T_FALSE:
                        this.establishTypeComparable(parentNode, dataTypes.BOOLEAN);
                        node.dataType = dataTypes.BOOLEAN;
                        break;
                    case T_QUOTE:
                        this.establishTypeComparable(parentNode, dataTypes.STRING);
                        node.dataType = dataTypes.STRING;
                        break;
                    case T_DIGIT:
                        this.establishTypeComparable(parentNode, dataTypes.INT);
                        node.dataType = dataTypes.INT;
                        break;
                    case T_ID:
                        var hashID = this.currentScope.assignHashID(node.name);
                        var type = this.currentScope.getEntry(hashID).getType();
                        this.establishTypeComparable(parentNode, type);
                        node.dataType = type;
                        break;
                    default:
                        // epsilon
                        break;
                }
            }
            // Traverse through the child nodes
            for (var i = 0; i < node.children.length; i++) {
                this.typeCheck(node.children[i]);
            }
            if ((node.children && node.children.length > 0) && node.name !== 'Block') {
                var parentNode = node.parent;
                var leftChild = node.children[0];
                var rightChild = node.children[1];
                if ((leftChild !== undefined && leftChild.dataType !== null)
                    && (rightChild !== undefined && rightChild.dataType !== null)) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Determining whether ' + leftChild.dataType + ' is type compatible ' +
                        'with ' + rightChild.dataType + ' on line ' + leftChild.lineNum + '.');
                    if (leftChild.dataType === rightChild.dataType) {
                        if (parentNode.name !== 'Block') {
                            // Left...right...doesn't matter here
                            var propagateType = leftChild.dataType;
                            if (node.name === '==' || node.name === '!=') {
                                propagateType = dataTypes.BOOLEAN;
                            }
                            this.establishTypeComparable(parentNode, propagateType);
                        }
                    }
                    else {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Type mismatch found on line ' + leftChild.lineNum +
                            '. The left side of the expression (' + leftChild.name + ':' + leftChild.dataType +
                            ') doesn\'t match up with the right side (' + rightChild.name + ':' + rightChild.dataType + ').');
                    }
                }
                else if ((leftChild !== undefined && leftChild.dataType === null)
                    && (rightChild !== undefined && rightChild.dataType !== null)) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Setting the type of ' + node.name + ' on line ' + leftChild.lineNum +
                        ' to ' + rightChild.dataType);
                    node.dataType = rightChild.dataType;
                }
                else if ((leftChild !== undefined && leftChild.dataType !== null)
                    && (rightChild !== undefined && rightChild.dataType === null)) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Setting the type of ' + node.name + ' on line ' + leftChild.lineNum +
                        ' to ' + rightChild.dataType);
                    node.dataType = leftChild.dataType;
                }
            }
        };
        SemanticAnalyzer.establishTypeComparable = function (parentNode, childType) {
            // CST: Var Declaration -> Type / Id -> <datatype> / <id>
            if (parentNode.children[0].dataType === null) {
                parentNode.children[0].dataType = childType;
            }
            else if (parentNode.children[1].dataType === null) {
                parentNode.children[1].dataType = childType;
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
        SemanticAnalyzer.currentScope = null;
        SemanticAnalyzer.nextScopeNum = 1;
        return SemanticAnalyzer;
    })();
    COMPILER.SemanticAnalyzer = SemanticAnalyzer;
})(COMPILER || (COMPILER = {}));
