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

        public createNode(name): any {
            var node = {
                name: name,
                parent: {},
                children: []
            };

            return node;
        }

        public addNode(name, type): void {
            var node: any = this.createNode(name);

            // Check to see if the node is a root node
            if (this.root === null || !this.root) {
                this.root = node;
            } else {
                node.parent = this.current;
                this.current.children.push(node);
            }

            if (type === "branch") {
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
            var result: string = '';

            // Space out based on the current depth
            for (var i = 0; i < depth; i++) {
                result += '-';
            }

            if (!node.children || node.children.length === 0) {
                result += '[' + node.name + ']';
                result += '\n';
            } else {
                result += '<' + node.name + '>'
                result += '\n';

                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i], depth++);
                }
            }

            return result;
        }

        public toString(): string {
            var treeString: string = '';
            treeString = this.expand(this.root, 0);

            return treeString;
        }
    }
}