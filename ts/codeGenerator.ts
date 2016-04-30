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
                1. If statement
                2. Multi scope support
            */
            this.generateCode(_AST.root);

            // Set break statement
            this.setCode('00');

            this.backpatch();
            console.log(this.codeTable);

            this.printResults();
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
                if (opcode.length === 1) {
                    opcode = '0' + opcode;
                }

                opcode = opcode.toUpperCase();

                this.codeTable[this.currentIndex] = opcode;
                this.currentIndex++;
            }
        }

        // Set the opcode on the target index of the code table
        public static injectCode(opcode, index): void {
            // Pad the opcode
            if (opcode.length === 1) {
                opcode = '0' + opcode;
            }

            opcode = opcode.toUpperCase();

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
            var id: string = node.children[0].name;
            var firstIdEntry: any = this.getEntry(id);

            if (node.children[1].tokenType === T_DIGIT) {
                // Handle integer assignment
                var value: number = parseInt(node.children[1].name);

                console.log(id + ': ' + value);
                this.setCode('A9');
                this.setCode(value.toString(16));

                this.setCode('8D');
                this.setCode(firstIdEntry.name);
                this.setCode('XX');
            } else if (node.children[1].tokenType === T_ID) {
                // Handle id assignment
                var secondIdEntry: any = this.getEntry(node.children[1].name);

                if (secondIdEntry !== null) {
                    this.setCode('AD');
                    this.setCode(secondIdEntry.name);
                    this.setCode('XX');

                    // Store the accumulator value at the id's address
                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                } else {
                    // throw error
                }
            } else if (node.children[1].tokenType === T_QUOTE) {
                var stringExpr: string = node.children[1].name;
                var stringLength: number = stringExpr.length;
                var stringStart: string = null;
                var startPoint: number = this.codeTable.length - 1;

                this.codeTable[startPoint] = '00';

                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    this.codeTable[i] = stringExpr.charCodeAt(--stringLength).toString(16).toUpperCase();
                    stringStart = i.toString(16).toUpperCase();
                }

                this.setCode('A9');
                this.setCode(stringStart);

                this.setCode('8D');
                this.setCode(firstIdEntry.name);
                this.setCode('XX');
            }
        }

        public static handlePrintStmt(node): void {
            if (node.children[0].tokenType === T_INT) {
                // Load the Y reg with the constant
                this.setCode('A0');
                this.setCode(node.children[0].name);

                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                this.setCode('01');

                // System call
                this.setCode('FF');
            } else if (node.children[0].tokenType === T_ID) {
                // Load the Y reg with the constant
                this.setCode('AC');

                var idEntry: any = this.getEntry(node.children[0].name);
                this.setCode(idEntry.name);
                this.setCode('XX');

                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                
                if (node.children[0].dataType === dataTypes.INT) {
                    this.setCode('01');
                } else if (node.children[0].dataType === dataTypes.STRING) {
                    this.setCode('02');
                }

                // System call
                this.setCode('FF');
            } else if (node.children[0].tokenType === T_QUOTE) {

            }
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

        // TODO: support different scopes
        public static getEntry(id/*, scope */): any {
            var entry: any = null;

            for (var i = 0; i < this.staticTable.length; i++) {
                if (id === this.staticTable[i].id) {
                    entry = this.staticTable[i];
                    break;
                }
            }

            return entry;
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

        public static printResults(): void {
            var content: string = '<div id="code">';

            for (var i = 0; i < this.codeTable.length; i++) {
                content += this.codeTable[i];

                if ((i + 1) % 8 === 0) {
                    content += '<br/>';
                } else {
                    content += ' ';
                }
            }

            content += '</div>';

            document.getElementById('code-gen').innerHTML = content;
        }
    }
}