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
// why doesn't this work?
var _Main;
var _Lexer;
