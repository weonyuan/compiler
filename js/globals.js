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
var T_EOF = 9;
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
var _Main;
var _Lexer;
var _Parser;
var _Token;
var _Errors = 0;
var _Warnings = 0;
var _Tokens = [];
var _PreviousToken = null;
var _CurrentToken = null;
