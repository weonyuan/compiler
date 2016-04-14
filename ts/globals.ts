/*
  globals.ts

  Global constants and variables.
*/

const APP_NAME: string = 'aBasicCompiler';
const APP_VERSION: string = '2.0';

// Token constants
const T_NOMATCH: number = -1;

const T_LBRACE: number = 0;
const T_RBRACE: number = 1;
const T_LPAREN: number = 2;
const T_RPAREN: number = 3;
const T_QUOTE: number = 4;
const T_ADD: number = 5;
const T_EXCLAMATION: number = 6;
const T_ASSIGN: number = 7;
const T_WHITESPACE: number = 8;
const T_EOP: number = 9;

const T_EQUAL: number = 10;
const T_NOTEQUAL: number = 11;

const T_TYPE: number = 12;
const T_INT: number = 13;
const T_STRING: number = 14;
const T_BOOLEAN: number = 15;

const T_FALSE: number = 16;
const T_TRUE: number = 17;
const T_DIGIT: number = 18;
const T_CHAR: number = 19;

const T_PRINT: number = 20;
const T_WHILE: number = 21;
const T_IF: number = 22;

const T_ID: number = 23;

// Logger constants
const LOG_ERROR: number = -1;
const LOG_WARNING: number = 0;
const LOG_INFO: number = 1;
const LOG_SUCCESS: number = 2;
const LOG_VERBOSE: number = 3;

// Used for building a tree
const BRANCH_NODE: string = 'branch';
const LEAF_NODE: string = 'leaf';

var tokenPattern = {
    // Reserved keywords
    T_PRINT: { type: T_PRINT, regex: /^print$/ },
    T_WHILE: { type: T_WHILE, regex: /^while$/ },
    T_IF: { type: T_IF, regex: /^if$/ },
    T_INT: { type: T_INT, regex: /^int$/ },
    T_STRING: { type: T_STRING, regex: /^string$/ },
    T_BOOLEAN: { type: T_BOOLEAN, regex: /^boolean$/ },
    T_TRUE: { type: T_TRUE, regex: /^true$/ },
    T_FALSE: { type: T_FALSE, regex: /^false$/ },
    // Identifiers
    T_ID: { type: T_ID, regex: /^[a-z]$/ },
    // Misc (symbols and characters)
    T_EQUAL: { type: T_EQUAL, regex: /^\=\=$/ },
    T_NOTEQUAL: { type: T_NOTEQUAL, regex: /^\!\=$/ },
    T_LBRACE: { type: T_LBRACE, regex: /^\{$/ },
    T_RBRACE: { type: T_RBRACE, regex: /^\}$/ },
    T_LPAREN: { type: T_LPAREN, regex: /^\($/ },
    T_RPAREN: { type: T_RPAREN, regex: /^\)$/ },
    T_QUOTE: { type: T_QUOTE, regex: /^\"$/ },
    T_DIGIT: { type: T_DIGIT, regex: /^[0-9]$/ },
    T_CHAR: { type: T_CHAR, regex: /^[a-z]$/ },
    T_ADD: { type: T_ADD, regex: /^\+$/ },
    T_EXCLAMATION: { type: T_EXCLAMATION, regex: /^\!$/ },
    T_ASSIGN: { type: T_ASSIGN, regex: /^\=$/ },
    T_WHITESPACE: { type: T_WHITESPACE, regex: /^\s|\n$/ },
    T_EOP: { type: T_EOP, regex: /^\$$/ }
};

// Used for loading a program into the textarea
var testPrograms = [
  '{} $',
  '{\n\tint a\n\tboolean b\n\tstring c\n} $',
  '{\n\tprint(1)\n} $',
  '{\n\tboolean a\n\ta = true\n\n\tprint (a)\n} $',
  '{\n\tif true {\n\t\tstring m\n\t\tm = "mike is the mcginndog"\n\t}\n} $',
  '{\n\tint a\n\tint b\n\n\ta = 1\n\tb = 3\n\tif (a == b) {\n \t\tstring m\n\t\tm = "mike is the mcginndog"\n\t}\n\tif (a != b) {\n\t\tstring m\n\t\tm = "mike is the mcginndogg"\n\t}\n} $',
  '{\n\tint a\n\ta = 0\n\twhile true {\n\t\ta = 2 + a\n \t\tprint(a)\n\t}\n} $',
  '{\n\tint a\n\ta = 0\n\n\twhile (a != 3) {\n\t\ta = 1 + a\n\t\tprint(a)\n\t}\n} $',
  '{\n\tint a\n\ta = 1 + 1\n} $',
  '{\n\tint a\n\tint b\n \ta = 4\n\tb = 1\n\tb = 1 + 5 + 7 + 3 + 2 + 3 + 9 + a\n} $',
  '{\n\tstring a\n\ta = ""\n} $',
  '{\n\tstring b\n\tb = "hi"\n} $',
  '{\n\tstring c\n\tc = "oh captain my captain"\n} $',
  '{\n\tboolean b\n\tb = false\n\tb = true\n\tb = false\n\tb = true\n}$',
  '{\n\tboolean a\n\ta = (false == ((true != true) == (true != false)))\n\n\tprint(a)\n} $',
  '{\n\tint a\n\tint b\n\n\ta = 1\n\tb = 2\n\n\t{\n\t\tint a\n\t\tint b\n\n\t\ta = 4\n\t\tb = 3\n\n\t\tprint(a)\n\t\tprint(b)\n\t}\n\n\tprint(a)\n\tprint(b)\n} $',
  '{\n\tint a\n\tint b\n\n\ta = 2\n\tb = 3\n\n\t{\n\t\tint b\n\t\tb = 4\n\t\t{\n\t\t\tint a\n\t\t\ta = 3\n\n\t\t\t{\n \t\t\t\tint c\n\t\t\t\tc = 9\n\n\t\t\t\tprint(a)\n\t\t\t\tprint(b)\n\t\t\t\tprint(c)\n\t\t\t}\n\n\t\t\tprint(a)\n\t\t\tprint(b)\n\t\t}\n\t\tprint(a)\n\t\tprint(b)\n\t}\n\tprint(a)\n\tprint(b)\n} $',
  '{\n\tint a\n\tint b\n\n\ta = 1\n\tb = 2\n\n\t{\n\t\tint a\n\t\tint b\n\n\t\ta = 4\n\t\tb = 3\n\n\t\tprint(a)\n\t\tprint(b)\n\t}\n\n\tprint(a)\n\tprint(b)\n} $\n\n{\n\tint a\n\tint b\n\n\ta = 2\n\tb = 3\n\n\t{\n\t\tint b\n\t\tb = 4\n\t\t{\n\t\t\tint a\n\t\t\ta = 3\n\n\t\t\t{\n\t\t\t\tint c\n\t\t\t\tc = 9\n\n\t\t\t\tprint(a)\n\t\t\t\tprint(b)\n\t\t\t\tprint(c)\n\t\t\t}\n\n\t\t\tprint(a)\n\t\t\tprint(b)\n\t\t}\n\t\tprint(a)\n\t\tprint(b)\n\t}\n\tprint(a)\n\tprint(b)\n} $',
  '{\n\tstring a\n\ta = "you smart\n\t\tyou loyal\n\t\tyou grateful\n \t\ti respect that"\n} $',
  '{\n\tint a\n\tint b\n\n\ta = 8\n\tb = 3\n \n \tif (a < b) {\n \t\t print(b)\n \t}\n} $',
  '{\nint a int b\t{\na\n\t\t=\n\t\t1\n\t\t\t{\n\t\t\t\tb= 4\n\t\t\t\t{ print (b)\n \t\t\t\t\t{print ( a)\n \t\t\t\t\t\t{\n int d\n\t\t\t\t\t\t\t{\nd =0\n\t\t\t\t\t\t\t\t{\n if (a == b)\n\t\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t\t\t{if(c!=d) {print(false)}}\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n} $',
  '{\n\tstring d\n\td = "Daniel Craig"\n} $',
  '{\n\tint x\n\tx 4\n} $'
];

var _Main: COMPILER.Main;
var _Lexer: COMPILER.Lexer;
var _Parser: COMPILER.Parser;
var _Token: COMPILER.Token;

// Global variables used for lexer and parser
var _VerboseMode: boolean = true;
var _Errors: number = 0;
var _Warnings: number = 0;
var _Tokens: any = [];
var _PreviousToken: any = null;
var _CurrentToken: any = null;

// Globals for semantic analysis
var _CST: COMPILER.Tree = null;
var _AST: COMPILER.Tree = null;
var _Symbols: number = 0;
var _SymbolTable: COMPILER.SymbolTable = null;