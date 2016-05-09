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
            this.printResults();
        };
        CodeGenerator.generateCode = function (node) {
            console.log(node);
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
                    jumpEntry = this.handleBooleanConditions(node);
                    conditionalBlock = true;
                    break;
                case 'While Statement':
                    // Set the return index to current index after
                    // while block finishes
                    jumpReturnIndex = this.currentIndex;
                    jumpEntry = this.handleBooleanConditions(node);
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
            // Set the opcode on the next available block
            if (this.codeTable[this.currentIndex] === '00') {
                if (opcode.length === 1) {
                    opcode = '0' + opcode;
                }
                opcode = opcode.toUpperCase();
                this.codeTable[this.currentIndex] = opcode;
                this.currentIndex++;
            }
        };
        // Set the opcode on the target index of the code table
        CodeGenerator.injectCode = function (opcode, index) {
            // Pad the opcode
            if (opcode.length === 1) {
                opcode = '0' + opcode;
            }
            opcode = opcode.toUpperCase();
            this.codeTable[index] = opcode;
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
                    tempEntry.scope = node.children[1].symbolEntry.scopeNum;
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
                    COMPILER.Main.addLog(LOG_VERBOSE, 'Adding integer addition assignment to id ' + id);
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
                    // Handle integer assignment
                    var value = parseInt(node.children[1].name);
                    console.log(node.name + ': ' + value);
                    this.setCode('A9');
                    this.setCode(value.toString(16));
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
            }
            else if (node.children[1].dataType === dataTypes.BOOLEAN) {
                var value = 0;
                if (node.children[1].tokenType === T_TRUE) {
                    value = 1;
                }
                this.setCode('A9');
                this.setCode(value.toString(16));
                this.setCode('8D');
                this.setCode(firstIdEntry.name);
                this.setCode('XX');
            }
            else if (node.children[1].dataType === dataTypes.STRING) {
                var stringExpr = node.children[1].name;
                var stringLength = stringExpr.length;
                var stringStart = null;
                var startPoint = this.heapIndex;
                this.injectCode('00', startPoint);
                this.heapIndex--;
                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    var charAscii = stringExpr.charCodeAt(--stringLength).toString(16);
                    this.injectCode(charAscii, i);
                    stringStart = i.toString(16).toUpperCase();
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
            else if (node.children[0].dataType === dataTypes.INT) {
                if (node.children[0].tokenType === T_ADD) {
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
                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                    this.setCode('AC');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                }
                else if (node.children[0].tokenType === T_DIGIT) {
                    // Handle integer assignment
                    var value = parseInt(node.children[1].name);
                    // Load the Y reg with the constant
                    this.setCode('A0');
                    this.setCode(node.children[0].name);
                }
                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                this.setCode('01');
            }
            else if (node.children[0].dataType === dataTypes.BOOLEAN) {
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
                var stringExpr = node.children[0].name;
                var stringLength = stringExpr.length;
                var stringStart = null;
                var startPoint = this.heapIndex;
                this.injectCode('00', startPoint);
                this.heapIndex--;
                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    var charAscii = stringExpr.charCodeAt(--stringLength).toString(16);
                    this.injectCode(charAscii, i);
                    stringStart = i.toString(16).toUpperCase();
                    this.heapIndex--;
                }
                this.setCode('A9');
                this.setCode(stringStart);
                this.setCode('A2');
                this.setCode('02');
            }
            // System call
            this.setCode('FF');
        };
        CodeGenerator.handleBooleanConditions = function (node) {
            if (node.children[0].tokenType === T_TRUE) {
                COMPILER.Main.addLog(LOG_VERBOSE, 'If/While statement is true.');
                this.setCode('A9');
                this.setCode('01');
            }
            else if (node.children[0].tokenType === T_FALSE) {
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
            COMPILER.Main.addLog(LOG_ERROR, 'Identifier ' + id + ' was not found in the static table.');
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
                    this.injectCode(targetIndex.toString(16), i++);
                    this.injectCode('00', i);
                }
                else if (currentCode.match(jumpNameRegex)) {
                    var jumpEntryIndex = parseInt(currentCode.substring(1));
                    var jumpEntry = this.jumpTable[jumpEntryIndex];
                    var jumpDistance = jumpEntry.distance.toString(16);
                    this.injectCode(jumpDistance, i);
                }
            }
        };
        CodeGenerator.printResults = function () {
            COMPILER.Main.addLog(LOG_INFO, 'Code generation completed.');
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
