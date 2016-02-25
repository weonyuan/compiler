/*
  globals.ts

  Global constants and variables.
*/

const APP_NAME: string = 'aBasicCompiler';
const APP_VERSION: string = '1.0';

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
const T_EOF: number = 9;

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
    T_EOF: { type: T_EOF, regex: /^\$$/ }
};

var _Main: COMPILER.Main;
var _Lexer: COMPILER.Lexer;
var _Parser: COMPILER.Parser;
var _Token: COMPILER.Token;

var _Errors: number = 0;
var _Warnings: number = 0;
var _Tokens: any = [];
var _PreviousToken: any = null;
var _CurrentToken: any = null;