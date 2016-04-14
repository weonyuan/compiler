///<reference path="token.ts" />
///<reference path="globals.ts" />
/*
    tree.ts

    Constructor for a tree.
    Based off from Alan Labouseur's tree constructor:
    http://labouseur.com/projects/jsTreeDemo/treeDemo.js
*/

module COMPILER {
    export class Tree {
        constructor(
            public root: any = null,
            public current: any = {}
        ) {}

        private treeString: string = '';

        public createNode(name): any {
            var node = {
                name: name,
                type: null,
                lineNum: null,
                parent: {},
                children: []
            };

            return node;
        }

        public addNode(name, nodeType, token): void {
            var node: any = this.createNode(name);

            if (nodeType === LEAF_NODE) {
                node.type = token.getType();
                node.lineNum = token.getLineNum();
            }

            // Check to see if the node is a root node
            if (this.root === null || !this.root) {
                this.root = node;
            } else {
                node.parent = this.current;
                this.current.children.push(node);
            }

            if (nodeType === BRANCH_NODE) {
                this.current = node;
            }
        }

        // Sounds a lot than ending children
        public levelUp(): void {
            // If there are no more leaf nodes, level up!
            if (this.current.parent !== null && this.current.parent.name !== undefined) {
                this.current = this.current.parent;
            }
        }


        public expand(node, depth): string {
            this.treeString += '<div>';

            // Space out based on the current depth
            for (var i = 0; i < depth; i++) {
                // this.treeString += '&emsp;';
                this.treeString += '-';
            }

            if (!node.children || node.children.length === 0) {
                // Encapsulate in square brackets if node has no children
                this.treeString += '[ ' + node.name + ' ]</div>';
                this.treeString += '\n';
            } else {
                // Otherwise, encapsulate in angle brackets
                this.treeString += '&lt;' + node.name + '&gt;</div>'
                this.treeString += '\n';

                // Recursively traverse through the children nodes
                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i], depth + 1);
                }
            }

            return this.treeString;
        }

        public printTreeString(location): void {
            this.treeString = this.expand(this.root, 0);
            document.getElementById(location).innerHTML = this.treeString;
        }
    }
}