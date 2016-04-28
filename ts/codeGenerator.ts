///<reference path="globals.ts" />
/*
    codeGenerator.ts

    Responsible for generator 6502a op codes from the AST.
*/

module COMPILER {
    export class CodeGenerator {
        public static codeTable: string[] = [];
        public static staticTable: any[] = [];
        public static jumpTable: any[] = [];
        public static currentIndex: number = 0;

        public static build(): void {
            Main.addLog(LOG_INFO, 'Performing 6502a code generation.');

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
        }

        public static generateCode(node): void {
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
        }

        public static setCode(opcode): void {
            // Set the opcode on the next available block
            if (this.codeTable[this.currentIndex] === '00') {
                this.codeTable[this.currentIndex] = opcode;
                this.currentIndex++;
            }
        }

        public static injectCode(opcode, index): void {
            // Set the opcode on the target index of the code table
            this.codeTable[index] = opcode;
        }

        public static handleVarDecl(node): void {
            var dataType: string = node.children[0].name;
            var id: string = node.children[1].name;
            
            // Initialize the id with '00'
            Main.addLog(LOG_VERBOSE, 'Generating declaration code for id ' + id + '.');
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
        }

        public static handleAssignmentStmt(node): void {

        }

        public static handlePrintStmt(node): void {

        }

        public static createTempEntry(): any {
            var tempEntry: any = {
                name: 'T' + this.staticTable.length,
                id: '',
                scope: 0,
                addressOffset: this.staticTable.length
            };

            this.staticTable.push(tempEntry);

            return tempEntry;
        }

        public static backpatch(): void {
            Main.addLog(LOG_VERBOSE, 'Backpatching the code.');

            var staticStartIndex: number = this.currentIndex;
            var currentCode: string = '';
            var tempNameRegex = /^T.*/;

            for (var i = 0; i < staticStartIndex; i++) {
                currentCode = this.codeTable[i];

                if (currentCode.match(tempNameRegex)) {
                    var tempEntryIndex: number = parseInt(currentCode.substring(1));
                    var tempEntry: any = this.staticTable[tempEntryIndex];

                    var targetIndex: number = staticStartIndex + tempEntryIndex;
                    console.log(targetIndex.toString(16));
                    this.injectCode(targetIndex.toString(16), i++);
                    this.injectCode('00', i);
                }
            }
        }
    }
}