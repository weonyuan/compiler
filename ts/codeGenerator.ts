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
        public static heapIndex: number = 0;

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

            this.heapIndex = this.codeTable.length - 1;

            /*
                TODO:
                1. If statement
                2. Multi scope support
            */
            this.generateCode(_AST.root);

            // Set break statement
            Main.addLog(LOG_VERBOSE, 'Adding break statement.');
            this.setCode('00');

            this.backpatch();
            this.printResults();
        }

        public static generateCode(node): void {
            console.log(node);
            var conditionalBlock: boolean = false;
            var jumpReturnIndex: number = -1;

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
                    this.handleBooleanConditions(node);

                    conditionalBlock = true;
                    break;
                case 'While Statement':
                    // Set the return index to current index after
                    // while block finishes
                    jumpReturnIndex = this.currentIndex;

                    this.handleBooleanConditions(node);

                    conditionalBlock = true;
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

        public static handleIntAddition(node, addresses): string[] {
            var value: number = parseInt(node.children[0].name);

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
            } else {
                if (node.children[1].tokenType === T_DIGIT) {
                    // We've reached the end so just add the codes for the last digit
                    var value: number = parseInt(node.children[1].name);

                    this.setCode('A9');
                    this.setCode(value.toString(16));

                    this.setCode('8D');
                
                    // Create a temporary entry for the constant
                    var tempEntry = this.createTempEntry();
                    // tempEntry.scope = 
                    this.setCode(tempEntry.name);
                    addresses.push(tempEntry.name);
                
                    this.setCode('XX');
                } else if (node.children[1].tokenType === T_ID) {
                    var idEntry: any = this.getEntry(node.children[1].name);
                    addresses.push(idEntry.name);
                }
            }
            
            return addresses;
        }

        public static handleAssignmentStmt(node): void {
            var id: string = node.children[0].name;
            var firstIdEntry: any = this.getEntry(id);

            // Check through every data type then do an identifier check
            if (node.children[1].tokenType === T_ID) {
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
            } else if (node.children[1].dataType === dataTypes.INT) {
                if (node.children[1].tokenType === T_ADD) {
                    var addresses: string[] = [];
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
                } else if (node.children[1].tokenType === T_DIGIT) {
                    // Handle integer assignment
                    var value: number = parseInt(node.children[1].name);

                    console.log(node.name + ': ' + value);
                    this.setCode('A9');
                    this.setCode(value.toString(16));

                    this.setCode('8D');
                    this.setCode(firstIdEntry.name);
                    this.setCode('XX');
                }
            } else if (node.children[1].dataType === dataTypes.BOOLEAN) {
                var value: number = 0;

                if (node.children[1].tokenType === T_TRUE) {
                    value = 1;
                }

                this.setCode('A9');
                this.setCode(value.toString(16));

                this.setCode('8D');
                this.setCode(firstIdEntry.name);
                this.setCode('XX');
            } else if (node.children[1].dataType === dataTypes.STRING) {
                var stringExpr: string = node.children[1].name;
                var stringLength: number = stringExpr.length;
                var stringStart: string = null;
                var startPoint: number = this.heapIndex;

                this.injectCode('00', startPoint);
                this.heapIndex--;

                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    var charAscii: string = stringExpr.charCodeAt(--stringLength).toString(16);
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
        }

        public static handlePrintStmt(node): void {
            if (node.children[0].tokenType === T_ID) {
                // Load the Y reg with the constant
                this.setCode('AC');

                var idEntry: any = this.getEntry(node.children[0].name);
                this.setCode(idEntry.name);
                this.setCode('XX');

                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');

                if (node.children[0].dataType === dataTypes.INT ||
                    node.children[0].dataType === dataTypes.BOOLEAN) {
                    this.setCode('01');
                } else if (node.children[0].dataType === dataTypes.STRING) {
                    this.setCode('02');
                }
            } else if (node.children[0].dataType === dataTypes.INT) {
                if (node.children[0].tokenType === T_ADD) {
                    var addresses: string[] = [];
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
                    // tempEntry.scope = ?

                    this.setCode('8D');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');

                    this.setCode('AC');
                    this.setCode(tempEntry.name);
                    this.setCode('XX');
                } else if (node.children[0].tokenType === T_DIGIT) {
                    // Handle integer assignment
                    var value: number = parseInt(node.children[1].name);

                    // Load the Y reg with the constant
                    this.setCode('A0');
                    this.setCode(node.children[0].name);
                }

                // Load the X reg with a 1 to prep for integer print
                this.setCode('A2');
                this.setCode('01');
            } else if (node.children[0].dataType === dataTypes.BOOLEAN) {
                this.setCode('A0');

                if (node.children[0].tokenType === T_TRUE) {
                    this.setCode('01');
                } else {
                    this.setCode('00');
                }

                // Load the X reg with a 1 to prep for boolean print
                this.setCode('A2');
                this.setCode('01');
            } else if (node.children[0].dataType === dataTypes.STRING) {
                var stringExpr: string = node.children[0].name;
                var stringLength: number = stringExpr.length;
                var stringStart: string = null;
                var startPoint: number = this.heapIndex;

                this.injectCode('00', startPoint);
                this.heapIndex--;

                for (var i = startPoint - 1; i > (startPoint - 1) - stringExpr.length; i--) {
                    var charAscii: string = stringExpr.charCodeAt(--stringLength).toString(16);
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
        }

        public static handleBooleanConditions(node): void {
            if (node.children[0].tokenType === T_TRUE) {
                Main.addLog(LOG_VERBOSE, 'If/While statement is true.');

                this.setCode('A9');
                this.setCode('01');
            } else if (node.children[0].tokenType === T_FALSE) {
                Main.addLog(LOG_VERBOSE, 'If/While statement is false.');

                this.setCode('A9');
                this.setCode('00');
            }

            var tempEntry = this.createTempEntry();
            // tempEntry.scope = ?

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

        public static createJumpEntry(): any {
            var jumpEntry: any = {
                name: 'J' + this.jumpTable.length,
                distance: 0
            };

            this.jumpTable.push(jumpEntry);

            return jumpEntry;
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
            var jumpNameRegex = /^J.*/;

            for (var i = 0; i < staticStartIndex; i++) {
                currentCode = this.codeTable[i];

                if (currentCode.match(tempNameRegex)) {
                    var tempEntryIndex: number = parseInt(currentCode.substring(1));
                    var tempEntry: any = this.staticTable[tempEntryIndex];
                    var targetIndex: number = staticStartIndex + tempEntryIndex;

                    this.injectCode(targetIndex.toString(16), i++);
                    this.injectCode('00', i);
                } else if (currentCode.match(jumpNameRegex)) {
                    var jumpEntryIndex: number = parseInt(currentCode.substring(1));
                    var jumpEntry: any = this.jumpTable[jumpEntryIndex];

                    jumpEntry.distance = this.currentIndex - jumpEntry.distance;
                    var jumpDistance: string = jumpEntry.distance.toString(16);

                    this.injectCode(jumpDistance, i);
                }
            }
        }

        public static printResults(): void {
            Main.addLog(LOG_INFO, 'Code generation completed.');
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