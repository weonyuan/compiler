///<reference path="globals.ts" />
/*
    codeGenerator.ts

    Responsible for generator 6502a op codes from the AST.
*/
var COMPILER;
(function (COMPILER) {
    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.build = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Performing 6502a code generation.');
            // Reset and initialize
            _Warnings = 0;
            _Errors = 0;
            this.codeTable = [];
            this.staticTable = [];
            this.jumpTable = [];
            this.currentIndex = 0;
            for (var i = 0; i < PROGRAM_SIZE; i++) {
                this.codeTable[i] = '00';
            }
            this.heapIndex = this.codeTable.length - 1;
            this.generateCode(_AST.root);
            // Set break statement
            COMPILER.Main.addLog(LOG_VERBOSE, 'Adding break statement.');
            this.setCode('00');
            this.backpatch();
            if (_Errors === 0) {
                this.printResults();
            }
        };
        CodeGenerator.generateCode = function (node) {
            var conditionalBlock = false;
            var jumpReturnIndex = -1;
            var jumpEntry = null;
            switch (node.name) {
                case 'Var Declaration':
                    this.handleVarDecl(node);
                    break;
                case 'Assignment Statement':
                    this.handleAssignmentStmt(node);
                    break;
                case 'Print Statement':
                    this.handlePrintStmt(node);
                    break;
                case 'If Statement':
                    jumpEntry = this.handleBooleanConditions(node.children[0]);
                    conditionalBlock = true;
                    break;
                case 'While Statement':
                    // Set the return index to current index after
                    // while block finishes
                    jumpReturnIndex = this.currentIndex;
                    jumpEntry = this.handleBooleanConditions(node.children[0]);
                    conditionalBlock = true;
                    break;
                default:
                    // epsilon
                    break;
            }
            for (var i = 0; i < node.children.length; i++) {
                this.generateCode(node.children[i]);
            }
            // Handles with while loops
            if (conditionalBlock) {
                if (jumpReturnIndex !== -1) {
                    // Load X reg with 0
                    this.setCode('A2');
                    this.setCode('00');
                    var tempEntry = this.createTempEntry();
                    // Load accumulator with 1
                    this.setCode('A9');
                    this.setCode('01');
                    // Store the accumulator value in a temp entry
                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    // Compare the X reg (0) and the temp entry
                    // This will set the Z flag to 0, so this will branch back
                    this.setCode('EC');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    var jumpReturnEntry = this.createJumpEntry();
                    // Branch back to the beginning of the loop
                    this.setCode('D0');
                    this.setCode(jumpReturnEntry.name);
                    jumpReturnEntry.distance = PROGRAM_SIZE - (this.currentIndex - jumpReturnIndex);
                }
                conditionalBlock = false;
                jumpEntry.distance = this.currentIndex - jumpEntry.distance + 1;
            }
        };
        CodeGenerator.setCode = function (opcode) {
            if (this.currentIndex <= this.heapIndex) {
                // Set the opcode on the next available block
                if (this.codeTable[this.currentIndex] === '00') {
                    if (opcode.length === 1) {
                        opcode = '0' + opcode;
                    }
                    opcode = opcode.toUpperCase();
                    this.codeTable[this.currentIndex] = opcode;
                    this.currentIndex++;
                }
            }
            else {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Stack overflow has occurred when attempted to ' +
                    'add the code ' + opcode + ' to the address ' + this.currentIndex.toString(16) +
                    '.');
            }
        };
        // Set the opcode on the target index of the code table
        CodeGenerator.injectCode = function (opcode, index) {
            if (index <= this.heapIndex) {
                // Pad the opcode
                if (opcode.length === 1) {
                    opcode = '0' + opcode;
                }
                opcode = opcode.toUpperCase();
                this.codeTable[index] = opcode;
            }
            else {
                _Errors;
                COMPILER.Main.addLog(LOG_ERROR, 'Stack overflow has occurred when attempted to ' +
                    'add the code ' + opcode + ' to the address ' + this.currentIndex.toString(16) +
                    '.');
            }
        };
        CodeGenerator.handleVarDecl = function (node) {
            var dataType = node.children[0].name;
            var id = node.children[1].name;
            var idScopeNum = node.children[1].symbolEntry.scopeNum;
            // Initialize the id with '00'
            COMPILER.Main.addLog(LOG_VERBOSE, 'Generating declaration code for id ' + id + '.');
            this.setCode('A9');
            this.setCode('00');
            // Create a temporary entry for the id
            var tempEntry = this.createTempEntry();
            tempEntry.id = id;
            tempEntry.scope = idScopeNum;
            // Store the accumulator value at the id's address
            this.setCode('8D');
            this.setCode(tempEntry.name);
            this.setCode('XX');
        };
        CodeGenerator.handleIntAddition = function (node, addresses) {
            var value = parseInt(node.children[0].name);
            this.setCode('A9');
            this.setCode(value.toString(16));
            // Create a temporary entry for the constant
            var tempEntry = this.createTempEntry();
            // tempEntry.scope = 
            this.setCode('8D');
            this.setCode(tempEntry.name);
            this.setCode('XX');
            addresses.push(tempEntry.name);
            if (node.children[1].tokenType === T_ADD) {
                // There are more addition to follow so run the method again
                this.handleIntAddition(node.children[1], addresses);
            }
            else {
                if (node.children[1].tokenType === T_DIGIT) {
                    // We've reached the end so just add the codes for the last digit
                    var value = parseInt(node.children[1].name);
                    this.setCode('A9');
                    this.setCode(value.toString(16));
                    this.setCode('8D');
                    // Create a temporary entry for the constant
                    var tempEntry = this.createTempEntry();
                    this.setCode(tempEntry.name);
                    addresses.push(tempEntry.name);
                    this.setCode('XX');
                }
                else if (node.children[1].tokenType === T_ID) {
                    var idName = node.children[1].name;
                    var idScopeNum = node.children[1].symbolEntry.scopeNum;
                    var idEntry = this.getEntry(idName, idScopeNum);
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Found ' + idEntry.name + ':digit to add.');
                    addresses.push(idEntry.name);
                }
            }
            return addresses;
        };
        CodeGenerator.handleAssignmentStmt = function (node) {
            var id = node.children[0].name;
            var scopeNum = node.children[0].symbolEntry.scopeNum;
            var firstIdEntry = this.getEntry(id, scopeNum);
            // Check through every data type then do an identifier check
            if (node.children[1].tokenType === T_ID) {
                // Handle id assignment
                var secondId = node.children[1].name;
                var secondScopeNum = node.children[1].symbolEntry.scopeNum;
                var secondIdEntry = this.getEntry(secondId, secondScopeNum);
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding ' + node.children[1].dataType + ' assignment ' +
                    ' to id ' + id + '.');
                if (secondIdEntry !== null) {
                    this.setCode('AD');
                    this.setCode(secondIdEntry.name);
                    this.setCode('XX');
                    // Store the accumulator value at the id's address
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
                else {
                }
            }
            else if (node.children[1].dataType === dataTypes.INT) {
                if (node.children[1].tokenType === T_ADD) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding integer addition assignment to id ' + id + '.');
                    var addresses = [];
                    addresses = this.handleIntAddition(node.children[1], addresses);
                    // Reset the accumulator to prep assignment by addition
                    this.setCode('A9');
                    this.setCode('00');
                    // Work backward because the addresses are little endian
                    for (var i = addresses.length - 1; i >= 0; i--) {
                        this.setCode('6D');
                        this.setCode(addresses[i]);
                        this.setCode('XX');
                    }
                    var tempEntry = this.createTempEntry();
                    // DOES THIS WORK?
                    tempEntry.scope = node.children[0].symbolEntry.scopeNum;
                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    this.setCode('AD');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
                else if (node.children[1].tokenType === T_DIGIT) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding integer assignment to id ' + id + '.');
                    // Handle integer assignment
                    var value = parseInt(node.children[1].name);
                    this.setCode('A9');
                    this.setCode(value.toString(16));
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
            }
            else if (node.children[1].dataType === dataTypes.BOOLEAN) {
                if (node.children[1].children.length === 0) {
                    // Leaf node
                    var value = 0;
                    if (node.children[1].tokenType === T_TRUE) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Adding boolean constant:true to id ' + id + '.');
                        value = 1;
                    }
                    else {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Adding boolean constant:false to id ' + id + '.');
                    }
                    this.setCode('A9');
                    this.setCode(value.toString(16));
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
                else {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding boolean expression assignment to id ' + id + '.');
                    var returnAddress = this.handleBooleanExpr(node.children[0]);
                    // Load the accumulator with the return address
                    this.setCode('AD');
                    this.setCode(returnAddress);
                    this.setCode('XX');
                    var tempEntry = this.getEntry(id, scopeNum);
                    // Store the value in the accumulator at the first id's address
                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                }
            }
            else if (node.children[1].dataType === dataTypes.STRING) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding string ' + stringExpr + ' on line ' + node.children[1].lineNum +
                    ' onto the heap.');
                var stringExpr = node.children[1].name;
                var stringLength = stringExpr.length;
                var stringStart = null;
                var startPoint = this.heapIndex;
                var staticEndIndex = this.currentIndex;
                this.injectCode('00', startPoint);
                this.heapIndex--;
                // Start from the end of the code table and allocate every character starting from the end
                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    if (i <= staticEndIndex) {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Heap overflow has occurred when trying to ' +
                            'add string ' + stringExpr + ' on line ' + node.children[1].lineNum + '.');
                        break;
                    }
                    var charAscii = stringExpr.charCodeAt(--stringLength).toString(16);
                    this.injectCode(charAscii, i);
                    stringStart = i.toString(16).toUpperCase();
                    // Update heap pointer
                    this.heapIndex--;
                }
                this.setCode('A9');
                this.setCode(stringStart);
                this.setCode('8D');
                this.setCode(firstIdEntry.name);
                this.setCode('XX');
            }
        };
        CodeGenerator.handlePrintStmt = function (node) {
            if (node.children[0].tokenType === T_ID) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of id ' + node.children[0].name + '.');
                // Load the Y reg with the constant
                this.setCode('AC');
                var idName = node.children[0].name;
                var idScopeNum = node.children[0].symbolEntry.scopeNum;
                var idEntry = this.getEntry(idName, idScopeNum);
                this.setCode(idEntry.name);
                this.setCode('XX');
                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                if (node.children[0].dataType === dataTypes.INT ||
                    node.children[0].dataType === dataTypes.BOOLEAN) {
                    this.setCode('01');
                }
                else if (node.children[0].dataType === dataTypes.STRING) {
                    this.setCode('02');
                }
            }
            else if (node.children[0].name === 'CompareEqual' ||
                node.children[0].name === 'CompareNotEqual') {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of a boolean expression.');
                var returnAddress = this.handleBooleanExpr(node.children[0]);
                // Load X reg with 1 to print int
                this.setCode('A2');
                this.setCode('01');
                // Load Y reg with the return address
                this.setCode('AC');
                this.setCode(returnAddress);
                this.setCode('XX');
            }
            else if (node.children[0].dataType === dataTypes.INT) {
                if (node.children[0].tokenType === T_ADD) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of an integer expression.');
                    var addresses = [];
                    addresses = this.handleIntAddition(node.children[0], addresses);
                    // Reset the accumulator to prep assignment by addition
                    this.setCode('A9');
                    this.setCode('00');
                    // Work backward because the addresses are little endian
                    for (var i = addresses.length - 1; i >= 0; i--) {
                        this.setCode('6D');
                        this.setCode(addresses[i]);
                        this.setCode('XX');
                    }
                    var tempEntry = this.createTempEntry();
                    tempEntry.scope = node.children[0].symbolEntry.scopeNum;
                    // Store the accumulator value to the temp entry
                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    // Load the Y reg with the value to print
                    this.setCode('AC');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                }
                else if (node.children[0].tokenType === T_DIGIT) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of an integer constant: ' + node.children[0].name + '.');
                    // Handle integer assignment
                    var value = parseInt(node.children[0].name);
                    // Load the Y reg with the constant
                    this.setCode('A0');
                    this.setCode(node.children[0].name);
                }
                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                this.setCode('01');
            }
            else if (node.children[0].dataType === dataTypes.BOOLEAN) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of a boolean constant: ' + node.children[0].name + '.');
                this.setCode('A0');
                if (node.children[0].tokenType === T_TRUE) {
                    this.setCode('01');
                }
                else {
                    this.setCode('00');
                }
                // Load the X reg with a 1 to prep for boolean print
                this.setCode('A2');
                this.setCode('01');
            }
            else if (node.children[0].dataType === dataTypes.STRING) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'Adding print statement of a string expression: ' + node.children[0].name + '.');
                var stringExpr = node.children[0].name;
                var stringLength = stringExpr.length;
                var stringStart = null;
                var startPoint = this.heapIndex;
                this.injectCode('00', startPoint);
                this.heapIndex--;
                // Start from the end of the code table and allocate every character starting from the end
                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    var charAscii = stringExpr.charCodeAt(--stringLength).toString(16);
                    this.injectCode(charAscii, i);
                    stringStart = i.toString(16).toUpperCase();
                    // Update heap pointer
                    this.heapIndex--;
                }
                this.setCode('A0');
                this.setCode(stringStart);
                this.setCode('A2');
                this.setCode('02');
            }
            // System call
            this.setCode('FF');
        };
        CodeGenerator.handleBooleanConditions = function (node) {
            if (node.children.length === 0) {
                // Leaf node
                if (node.tokenType === T_TRUE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'If/While statement is true.');
                    this.setCode('A9');
                    this.setCode('01');
                }
                else if (node.tokenType === T_FALSE) {
                    COMPILER.Main.addLog(LOG_VERBOSE, 'If/While statement is false.');
                    this.setCode('A9');
                    this.setCode('00');
                }
                var tempEntry = this.createTempEntry();
                this.setCode('8D');
                this.setCode(tempEntry.name);
                this.setCode('XX');
                // Load X reg with 1 (true)
                this.setCode('A2');
                this.setCode('01');
                // Compare the X reg and the memory address
                this.setCode('EC');
                this.setCode(tempEntry.name);
                this.setCode('XX');
                var jumpEntry = this.createJumpEntry();
                // Branch n bytes ONLY if Z flag is 0 (false)
                this.setCode('D0');
                this.setCode(jumpEntry.name);
                // Store the current index for now...as a starting point
                jumpEntry.distance = this.currentIndex + 1;
                return jumpEntry;
            }
            else {
                // Branch node
                COMPILER.Main.addLog(LOG_VERBOSE, 'If/While statement is a boolean expression.');
                var address = this.handleBooleanExpr(node);
                // Load X reg with 1 for comparison
                this.setCode('A2');
                this.setCode('01');
                // Compare X Reg with the address returned from the handling
                this.setCode('EC');
                this.setCode(address);
                this.setCode('XX');
                var jumpEntry = this.createJumpEntry();
                // BNE around the if/while block
                this.setCode('D0');
                this.setCode(jumpEntry.name);
                jumpEntry.distance = this.currentIndex + 1;
                return jumpEntry;
            }
        };
        CodeGenerator.handleBooleanExpr = function (node) {
            var returnAddress = '';
            if (node !== null) {
                var leftChildAddress = '';
                var rightChildAddress = '';
                if (node.children.length > 0) {
                    // Node is a branch node
                    leftChildAddress = this.handleBooleanExpr(node.children[0]);
                    rightChildAddress = this.handleBooleanExpr(node.children[1]);
                    if (leftChildAddress.length > 0 && rightChildAddress.length > 0) {
                        // Load the left child's address into X reg
                        this.setCode('AE');
                        this.setCode(leftChildAddress); // left child address
                        this.setCode('00');
                        // Compare the left address (in X reg) to the right address
                        this.setCode('EC');
                        this.setCode(rightChildAddress); // right child address
                        this.setCode('00');
                        if (node.name === 'CompareEqual') {
                            COMPILER.Main.addLog(LOG_VERBOSE, 'Determining whether the content of address ' +
                                leftChildAddress + ' == content of address ' + rightChildAddress);
                            var tempEntry = this.createTempEntry();
                            var jumpEntryCompareNotEqual = this.createJumpEntry();
                            var jumpEntryCompareEqual = this.createJumpEntry();
                            this.jumpTable.push(jumpEntryCompareNotEqual);
                            this.jumpTable.push(jumpEntryCompareEqual);
                            // Load accumulator with 0
                            this.setCode('A9');
                            this.setCode('00');
                            // Store the accumulator value at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            // Branch out if Z flag is 0
                            this.setCode('D0');
                            this.setCode(jumpEntryCompareNotEqual.name);
                            var firstJumpReturnIndex = this.currentIndex;
                            // Load accumulator with 1
                            this.setCode('A9');
                            this.setCode('01');
                            // Store the accumulator value at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            jumpEntryCompareNotEqual.distance = this.currentIndex - firstJumpReturnIndex;
                            // Load X reg with 0 to set up next jump
                            this.setCode('A2');
                            this.setCode('00');
                            // Compare X reg and return address
                            this.setCode('EC');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            // Branch if Z flag is 0
                            this.setCode('D0');
                            this.setCode(jumpEntryCompareEqual.name);
                            var secondJumpReturnIndex = this.currentIndex;
                            // Load accumulator with 0
                            this.setCode('A9');
                            this.setCode('00');
                            // Store the accumulator at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            jumpEntryCompareEqual.distance = this.currentIndex - secondJumpReturnIndex;
                            returnAddress = tempEntry.name;
                        }
                        else if (node.name === 'CompareNotEqual') {
                            COMPILER.Main.addLog(LOG_VERBOSE, 'Determining whether the content of address ' +
                                leftChildAddress + ' != content of address ' + rightChildAddress);
                            var tempEntry = this.createTempEntry();
                            var jumpEntryCompareNotEqual = this.createJumpEntry();
                            var jumpEntryCompareEqual = this.createJumpEntry();
                            this.jumpTable.push(jumpEntryCompareNotEqual);
                            this.jumpTable.push(jumpEntryCompareEqual);
                            // Load accumulator with 1
                            this.setCode('A9');
                            this.setCode('01');
                            // Store the accumulator value at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            // Branch out if Z flag is 0
                            this.setCode('D0');
                            this.setCode(jumpEntryCompareNotEqual.name);
                            var firstJumpReturnIndex = this.currentIndex;
                            // Load accumulator with 1
                            this.setCode('A9');
                            this.setCode('00');
                            // Store the accumulator value at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            jumpEntryCompareNotEqual.distance = this.currentIndex - firstJumpReturnIndex;
                            // Load X reg with 0 to set up next jump
                            this.setCode('A2');
                            this.setCode('01');
                            // Compare X reg and return address
                            this.setCode('EC');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            // Branch if Z flag is 0
                            this.setCode('D0');
                            this.setCode(jumpEntryCompareEqual.name);
                            var secondJumpReturnIndex = this.currentIndex;
                            // Load accumulator with 0
                            this.setCode('A9');
                            this.setCode('01');
                            // Store the accumulator at the return address
                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');
                            jumpEntryCompareEqual.distance = this.currentIndex - secondJumpReturnIndex;
                            returnAddress = tempEntry.name;
                        }
                    }
                }
                else if (node.children.length === 0) {
                    // Leaf nodes
                    if (node.tokenType === T_DIGIT) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Storing temporary entry of an integer literal in static table.');
                        // Load accumulator with the digit
                        this.setCode('A9');
                        this.setCode(node.name);
                        var tempEntry = this.createTempEntry();
                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');
                        returnAddress = tempEntry.name;
                    }
                    else if (node.tokenType === T_TRUE) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Storing temporary entry of a true literal in static table.');
                        // Load accumulator with the true value...get it? true?
                        this.setCode('A9');
                        this.setCode('01');
                        var tempEntry = this.createTempEntry();
                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');
                        returnAddress = tempEntry.name;
                    }
                    else if (node.tokenType === T_FALSE) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Storing temporary entry of a false literal in static table.');
                        // Load accumulator with the false value
                        this.setCode('A9');
                        this.setCode('00');
                        var tempEntry = this.createTempEntry();
                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');
                        returnAddress = tempEntry.name;
                    }
                    else if (node.tokenType === T_ID) {
                        var id = node.name;
                        var scopeNum = node.symbolEntry.scopeNum;
                        var idEntry = this.getEntry(id, scopeNum);
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Returning address of id ' + id + '.');
                        returnAddress = idEntry.name;
                    }
                    else if (node.tokenType === T_QUOTE) {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'String literal on line ' + node.lineNum +
                            ' is not allowed.');
                    }
                }
            }
            return returnAddress;
        };
        CodeGenerator.createTempEntry = function () {
            var tempEntry = {
                name: 'T' + this.staticTable.length,
                id: '',
                scope: 0,
                addressOffset: this.staticTable.length
            };
            this.staticTable.push(tempEntry);
            return tempEntry;
        };
        CodeGenerator.createJumpEntry = function () {
            var jumpEntry = {
                name: 'J' + this.jumpTable.length,
                distance: 0
            };
            this.jumpTable.push(jumpEntry);
            return jumpEntry;
        };
        CodeGenerator.getEntry = function (id, scope) {
            var entry = null;
            for (var i = 0; i < this.staticTable.length; i++) {
                entry = this.staticTable[i];
                if (id === entry.id && scope === entry.scope) {
                    return entry;
                }
            }
            if (entry === null) {
                _Errors++;
                COMPILER.Main.addLog(LOG_ERROR, 'Identifier ' + id + ' was not found in the static table.');
            }
            return null;
        };
        CodeGenerator.backpatch = function () {
            COMPILER.Main.addLog(LOG_VERBOSE, 'Backpatching the code.');
            var staticStartIndex = this.currentIndex;
            var currentCode = '';
            var tempNameRegex = /^T.*/;
            var jumpNameRegex = /^J.*/;
            for (var i = 0; i < staticStartIndex; i++) {
                currentCode = this.codeTable[i];
                if (currentCode.match(tempNameRegex)) {
                    var tempEntryIndex = parseInt(currentCode.substring(1));
                    var tempEntry = this.staticTable[tempEntryIndex];
                    var targetIndex = staticStartIndex + tempEntryIndex;
                    if (targetIndex < this.heapIndex) {
                        COMPILER.Main.addLog(LOG_VERBOSE, 'Assigning temp entry ' + tempEntry.name + ' address to ' +
                            targetIndex.toString(16).toUpperCase() + '.');
                        this.injectCode(targetIndex.toString(16), i++);
                        this.injectCode('00', i);
                    }
                    else {
                        _Errors++;
                        COMPILER.Main.addLog(LOG_ERROR, 'Static space is colliding with heap space when ' +
                            tempEntry.name + ' was assigned the address ' + targetIndex.toString(16).toUpperCase() + '.');
                        break;
                    }
                }
                else if (currentCode.match(jumpNameRegex)) {
                    var jumpEntryIndex = parseInt(currentCode.substring(1));
                    var jumpEntry = this.jumpTable[jumpEntryIndex];
                    var jumpDistance = jumpEntry.distance.toString(16);
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Resolving jump entry\'s distance (' + currentCode +
                        ') to ' + jumpDistance + '.');
                    this.injectCode(jumpDistance, i);
                }
            }
        };
        CodeGenerator.printResults = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Code generator complete. Generator found ' + _Errors + ' error(s) and ' + _Warnings + ' warning(s).');
            var content = '<div id="code">';
            for (var i = 0; i < this.codeTable.length; i++) {
                content += this.codeTable[i];
                if ((i + 1) % 8 === 0) {
                    content += '<br/>';
                }
                else {
                    content += ' ';
                }
            }
            content += '</div>';
            document.getElementById('code-gen').innerHTML = content;
        };
        CodeGenerator.codeTable = [];
        CodeGenerator.staticTable = [];
        CodeGenerator.jumpTable = [];
        CodeGenerator.currentIndex = 0;
        CodeGenerator.heapIndex = 0;
        return CodeGenerator;
    })();
    COMPILER.CodeGenerator = CodeGenerator;
})(COMPILER || (COMPILER = {}));
