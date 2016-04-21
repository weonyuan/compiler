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
            this.codeTable = [];
            for (var i = 0; i < PROGRAM_SIZE; i++) {
                this.codeTable[i] = '00';
            }
            this.staticTable = [];
            this.jumpTable = [];
        };
        CodeGenerator.codeTable = null;
        CodeGenerator.staticTable = null;
        CodeGenerator.jumpTable = null;
        return CodeGenerator;
    })();
    COMPILER.CodeGenerator = CodeGenerator;
})(COMPILER || (COMPILER = {}));
