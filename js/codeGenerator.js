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
            /*
                TODO:
                1. If statement
                2. Multi scope support
            */
            this.generateCode(_AST.root);
            // Set break statement
            this.setCode('00');
            this.backpatch();
            console.log(this.codeTable);
            this.printResults();
        };
        CodeGenerator.generateCode = function (node) {
            console.log(node);
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
                default:
                    // epsilon
                    break;
            }
            for (var i = 0; i < node.children.length; i++) {
                this.generateCode(node.children[i]);
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
            // Initialize the id with '00'
            COMPILER.Main.addLog(LOG_VERBOSE, 'Generating declaration code for id ' + id + '.');
            this.setCode('A9');
            this.setCode('00');
            // Create a temporary entry for the id
            var tempEntry = this.createTempEntry();
            tempEntry.id = id;
            // tempEntry.scope = 
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
                    // tempEntry.scope = 
                    this.setCode(tempEntry.name);
                    addresses.push(tempEntry.name);
                    this.setCode('XX');
                }
                else if (node.children[1].tokenType === T_ID) {
                    var idEntry = this.getEntry(node.children[1].name);
                    addresses.push(idEntry.name);
                }
            }
            return addresses;
        };
        CodeGenerator.handleAssignmentStmt = function (node) {
            var id = node.children[0].name;
            var firstIdEntry = this.getEntry(id);
            // Check through every data type then do an identifier check
            if (node.children[1].tokenType === T_ID) {
                // Handle id assignment
                var secondIdEntry = this.getEntry(node.children[1].name);
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
                    // tempEntry.scope = ?
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
                this.codeTable[startPoint] = '00';
                this.heapIndex--;
                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    this.codeTable[i] = stringExpr.charCodeAt(--stringLength).toString(16).toUpperCase();
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
            if (node.children[0].tokenType === T_INT) {
                // Load the Y reg with the constant
                this.setCode('A0');
                this.setCode(node.children[0].name);
                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                this.setCode('01');
                // System call
                this.setCode('FF');
            }
            else if (node.children[0].tokenType === T_ID) {
                // Load the Y reg with the constant
                this.setCode('AC');
                var idEntry = this.getEntry(node.children[0].name);
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
                // System call
                this.setCode('FF');
            }
            else if (node.children[0].tokenType === T_QUOTE) {
            }
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
        // TODO: support different scopes
        CodeGenerator.getEntry = function (id /*, scope */) {
            var entry = null;
            for (var i = 0; i < this.staticTable.length; i++) {
                if (id === this.staticTable[i].id) {
                    entry = this.staticTable[i];
                    break;
                }
            }
            return entry;
        };
        CodeGenerator.backpatch = function () {
            COMPILER.Main.addLog(LOG_VERBOSE, 'Backpatching the code.');
            var staticStartIndex = this.currentIndex;
            var currentCode = '';
            var tempNameRegex = /^T.*/;
            for (var i = 0; i < staticStartIndex; i++) {
                currentCode = this.codeTable[i];
                if (currentCode.match(tempNameRegex)) {
                    var tempEntryIndex = parseInt(currentCode.substring(1));
                    var tempEntry = this.staticTable[tempEntryIndex];
                    var targetIndex = staticStartIndex + tempEntryIndex;
                    //console.log(targetIndex.toString(16));
                    this.injectCode(targetIndex.toString(16), i++);
                    this.injectCode('00', i);
                }
            }
        };
        CodeGenerator.printResults = function () {
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
