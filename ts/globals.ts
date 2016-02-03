/*
  globals.ts

  Global constants and variables.
*/

const APP_NAME: string = 'compiler^2';
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

// why doesn't this work?
var _Main: COMPILER.Main;
var _Lexer: COMPILER.Lexer;