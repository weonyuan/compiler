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

        public static build(): void {
            Main.addLog(LOG_INFO, 'Performing 6502a code generation.');

            this.codeTable = [];
            this.staticTable = [];
            this.jumpTable = [];

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
            console.log(this.codeTable);
            this.backpatch();
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
            for (var i = 0; i < this.codeTable.length; i++) {
                if (this.codeTable[i] === '00') {
                    this.codeTable[i] = opcode;
                    break;
                }
            }
        }

        public static handleVarDecl(node): void {
            var dataType: string = node.children[0].name;
            var id: string = node.children[1].name;
            
            Main.addLog(LOG_VERBOSE, 'Generating declaration code for id ' + id + '.');
            this.setCode('A9');
            this.setCode('00');

            var tempEntry = this.createTempEntry();
            tempEntry.id = id;
            // tempEntry.scope = 

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
                addressOffset: 0
            };

            this.staticTable.push(tempEntry);

            return tempEntry;
        }

        public static backpatch(): void {
            Main.addLog(LOG_VERBOSE, 'Backpatching the code.');
        }
    }
}