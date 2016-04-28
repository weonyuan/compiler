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
            /*
                TODO:
                1. Var Declaration
                2. Int assignment
                3. String assignment
            */
            this.generateCode(_AST.root);
            // Set break statement
            this.setCode('00');
            this.backpatch();
            console.log(this.codeTable);
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
                this.codeTable[this.currentIndex] = opcode;
                this.currentIndex++;
            }
        };
        CodeGenerator.injectCode = function (opcode, index) {
            // Set the opcode on the target index of the code table
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
        CodeGenerator.handleAssignmentStmt = function (node) {
        };
        CodeGenerator.handlePrintStmt = function (node) {
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
                    console.log(targetIndex.toString(16));
                    this.injectCode(targetIndex.toString(16), i++);
                    this.injectCode('00', i);
                }
            }
        };
        CodeGenerator.codeTable = [];
        CodeGenerator.staticTable = [];
        CodeGenerator.jumpTable = [];
        CodeGenerator.currentIndex = 0;
        return CodeGenerator;
    })();
    COMPILER.CodeGenerator = CodeGenerator;
})(COMPILER || (COMPILER = {}));
