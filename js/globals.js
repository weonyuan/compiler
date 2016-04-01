/*
  globals.ts

  Global constants and variables.
*/
var APP_NAME = 'aBasicCompiler';
var APP_VERSION = '1.0';
// Token constants
var T_NOMATCH = -1;
var T_LBRACE = 0;
var T_RBRACE = 1;
var T_LPAREN = 2;
var T_RPAREN = 3;
var T_QUOTE = 4;
var T_ADD = 5;
var T_EXCLAMATION = 6;
var T_ASSIGN = 7;
var T_WHITESPACE = 8;
var T_EOP = 9;
var T_EQUAL = 10;
var T_NOTEQUAL = 11;
var T_TYPE = 12;
var T_INT = 13;
var T_STRING = 14;
var T_BOOLEAN = 15;
var T_FALSE = 16;
var T_TRUE = 17;
var T_DIGIT = 18;
var T_CHAR = 19;
var T_PRINT = 20;
var T_WHILE = 21;
var T_IF = 22;
var T_ID = 23;
// Logger constants
var LOG_ERROR = -1;
var LOG_WARNING = 0;
var LOG_INFO = 1;
var LOG_SUCCESS = 2;
var LOG_VERBOSE = 3;
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
var _Main;
var _Lexer;
var _Parser;
var _Token;
var _CST;
// Global variables used for lexer and parser
var _VerboseMode = true;
var _Errors = 0;
var _Warnings = 0;
var _Tokens = [];
var _PreviousToken = null;
var _CurrentToken = null;
