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
            var jumpEntry: any = null;

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

                    var tempEntry: any = this.createTempEntry();

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

                    var jumpReturnEntry: any = this.createJumpEntry();

                    // Branch back to the beginning of the loop
                    this.setCode('D0');
                    this.setCode(jumpReturnEntry.name);
                    jumpReturnEntry.distance = PROGRAM_SIZE - (this.currentIndex - jumpReturnIndex);
                }

                conditionalBlock = false;
                jumpEntry.distance = this.currentIndex - jumpEntry.distance + 1;
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
            var idScopeNum: number = node.children[1].symbolEntry.scopeNum;
            
            // Initialize the id with '00'
            Main.addLog(LOG_VERBOSE, 'Generating declaration code for id ' + id + '.');
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
                    tempEntry.scope = node.children[1].symbolEntry.scopeNum;

                    this.setCode(tempEntry.name);
                    addresses.push(tempEntry.name);
                
                    this.setCode('XX');
                } else if (node.children[1].tokenType === T_ID) {
                    var idName: string = node.children[1].name;
                    var idScopeNum: number = node.children[1].symbolEntry.scopeNum;
                    var idEntry: any = this.getEntry(idName, idScopeNum);

                    Main.addLog(LOG_VERBOSE, 'Found ' + idEntry.name + ':digit to add.');

                    addresses.push(idEntry.name);
                }
            }
            
            return addresses;
        }

        public static handleAssignmentStmt(node): void {
            var id: string = node.children[0].name;
            var scopeNum: number = node.children[0].symbolEntry.scopeNum;
            var firstIdEntry: any = this.getEntry(id, scopeNum);

            // Check through every data type then do an identifier check
            if (node.children[1].tokenType === T_ID) {
                // Handle id assignment
                var secondId: string = node.children[1].name;
                var secondScopeNum: number = node.children[1].symbolEntry.scopeNum;
                var secondIdEntry: any = this.getEntry(secondId, secondScopeNum);

                Main.addLog(LOG_VERBOSE, 'Adding ' + node.children[1].dataType + ' assignment ' +
                    ' to id ' + id + '.');

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
                    Main.addLog(LOG_VERBOSE, 'Adding integer addition assignment to id ' + id + '.');

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
                } else if (node.children[1].tokenType === T_DIGIT) {
                    Main.addLog(LOG_VERBOSE, 'Adding integer assignment to id ' + id + '.');

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
                    Main.addLog(LOG_VERBOSE, 'Adding boolean constant:true to id ' + id + '.');
                    value = 1;
                } else {
                    Main.addLog(LOG_VERBOSE, 'Adding boolean constant:false to id ' + id + '.');
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

                var idName: string = node.children[0].name;
                var idScopeNum: number = node.children[0].symbolEntry.scopeNum;
                var idEntry: any = this.getEntry(idName, idScopeNum);
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
                    tempEntry.scope = node.children[0].symbolEntry.scopeNum;

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

        public static handleBooleanConditions(node): any {
            if (node.children.length === 0) {
                // Leaf node
                if (node.tokenType === T_TRUE) {
                    Main.addLog(LOG_VERBOSE, 'If/While statement is true.');

                    this.setCode('A9');
                    this.setCode('01');
                } else if (node.tokenType === T_FALSE) {
                    Main.addLog(LOG_VERBOSE, 'If/While statement is false.');

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
            } else {
                // Branch node
                Main.addLog(LOG_VERBOSE, 'If/While statement is a boolean expression.');

                var address: string = this.handleBooleanExpr(node);

                // Load X reg with 1 for comparison
                this.setCode('A2');
                this.setCode('01');

                // Compare X Reg with the address returned from the handling
                this.setCode('EC');
                this.setCode(address);
                this.setCode('XX');

                var jumpEntry: any = this.createJumpEntry();

                // BNE around the if/while block
                this.setCode('D0');
                this.setCode(jumpEntry.name);

                jumpEntry.distance = this.currentIndex + 1;

                return jumpEntry;
            }
        }

        public static handleBooleanExpr(node): string {
            var returnAddress: string = '';

            if (node !== null) {
                var leftChildAddress: string = '';
                var rightChildAddress: string = '';

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
                            var tempEntry: any = this.createTempEntry();

                            var jumpEntryCompareNotEqual: any = this.createJumpEntry();
                            var jumpEntryCompareEqual: any = this.createJumpEntry();
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

                            var firstJumpReturnIndex: number = this.currentIndex;

                            this.setCode('A9');
                            this.setCode('01');

                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            jumpEntryCompareNotEqual.distance = this.currentIndex - firstJumpReturnIndex;

                            this.setCode('A2');
                            this.setCode('00');

                            this.setCode('EC');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            this.setCode('D0');
                            this.setCode(jumpEntryCompareEqual.name);

                            var secondJumpReturnIndex: number = this.currentIndex;

                            this.setCode('A9');
                            this.setCode('00');

                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            jumpEntryCompareEqual.distance = this.currentIndex - secondJumpReturnIndex;

                            returnAddress = tempEntry.name;
                        } else if (node.name === 'CompareNotEqual') {
                            var tempEntry: any = this.createTempEntry();

                            var jumpEntryCompareNotEqual: any = this.createJumpEntry();
                            var jumpEntryCompareEqual: any = this.createJumpEntry();
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

                            var firstJumpReturnIndex: number = this.currentIndex;

                            this.setCode('A9');
                            this.setCode('00');

                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            jumpEntryCompareNotEqual.distance = this.currentIndex - firstJumpReturnIndex;

                            this.setCode('A2');
                            this.setCode('01');

                            this.setCode('EC');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            this.setCode('D0');
                            this.setCode(jumpEntryCompareEqual.name);

                            var secondJumpReturnIndex: number = this.currentIndex;

                            this.setCode('A9');
                            this.setCode('01');

                            this.setCode('8D');
                            this.setCode(tempEntry.name);
                            this.setCode('XX');

                            jumpEntryCompareEqual.distance = this.currentIndex - secondJumpReturnIndex;

                            returnAddress = tempEntry.name;
                        }
                    }
                } else if (node.tokenType !== null) {
                    // Leaf nodes
                    if (node.tokenType === T_DIGIT) {
                        // Load accumulator with the digit
                        this.setCode('A9');
                        this.setCode(node.name);

                        var tempEntry: any = this.createTempEntry();

                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');

                        returnAddress = tempEntry.name;
                    } else if (node.tokenType === T_TRUE) {
                        // Load accumulator with the true value...get it? true?
                        this.setCode('A9');
                        this.setCode('01');

                        var tempEntry: any = this.createTempEntry();

                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');

                        returnAddress = tempEntry.name;
                    } else if (node.tokenType === T_FALSE) {
                        // Load accumulator with the false value
                        this.setCode('A9');
                        this.setCode('00');

                        var tempEntry: any = this.createTempEntry();

                        // Store accumulator value at the temp entry's address
                        this.setCode('8D');
                        this.setCode(tempEntry.name);
                        this.setCode('XX');

                        returnAddress = tempEntry.name;
                    } else if (node.tokenType === T_ID) {
                        var id: string = node.name;
                        var scopeNum: number = node.symbolEntry.scopeNum;
                        var idEntry: any = this.getEntry(id, scopeNum);

                        returnAddress = idEntry.name;
                    } else if (node.tokenType === T_QUOTE) {
                        _Errors++;
                        Main.addLog(LOG_ERROR, 'String literal on line ' + node.lineNum +
                            ' is not allowed.');
                    }
                }
            }

            return returnAddress;
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

        public static getEntry(id, scope): any {
            var entry: any = null;

            for (var i = 0; i < this.staticTable.length; i++) {
                entry = this.staticTable[i];
                if (id === entry.id && scope === entry.scope) {
                    return entry;
                }
            }

            Main.addLog(LOG_ERROR, 'Identifier ' + id + ' was not found in the static table.');

            return null;
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
                    var jumpDistance: string = jumpEntry.distance.toString(16);

                    Main.addLog(LOG_VERBOSE, 'Resolving jump entry\'s distance (' + currentCode +
                        ') to ' + jumpDistance + '.');

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