///<reference path="globals.ts" />
/*
    main.ts

    Responsible for managing the user interface and
    calling the compiler.
*/

module COMPILER {
    export class Main {
        public static compile(): void {
            var sourceCode: string = (<HTMLTextAreaElement> document.getElementById('inputText')).value;
            Lexer.tokenize(sourceCode);
            this.log('');
        }

        public static log(msg): void {
            var divLog = document.createElement('div');
            divLog.className = 'log';
            document.getElementById('logger').appendChild(divLog);

            var divLogStatus = document.createElement('div');
            divLogStatus.className = 'label label-info status';
            divLogStatus.innerHTML = 'INFO';
            var lastLog = document.getElementsByClassName('log')[document.getElementsByClassName('log').length - 1];
            lastLog.appendChild(divLogStatus);
            
            var divLogMessage = document.createElement('div');
            divLogMessage.className = 'message';
            divLogMessage.innerHTML = 'Performing something...';
            lastLog.appendChild(divLogMessage);
        }
    }
}