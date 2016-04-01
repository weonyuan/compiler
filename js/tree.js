///<reference path="globals.ts" />
/*
    tree.ts

    Constructor for a tree.
    Based off from Alan Labouseur's tree constructor:
    http://labouseur.com/projects/jsTreeDemo/treeDemo.js
*/
var COMPILER;
(function (COMPILER) {
    var Tree = (function () {
        function Tree(root, current) {
            if (root === void 0) { root = null; }
            if (current === void 0) { current = {}; }
            this.root = root;
            this.current = current;
        }
        Tree.prototype.createNode = function (name) {
            var node = {
                name: name,
                parent: {},
                children: []
            };
            return node;
        };
        Tree.prototype.addNode = function (name, type) {
            var node = this.createNode(name);
            // Check to see if the node is a root node
            if (this.root === null || !this.root) {
                this.root = node;
            }
            else {
                node.parent = this.current;
                this.current.children.push(node);
            }
            if (type === "branch") {
                this.current = node;
            }
        };
        // Sounds a lot than ending children
        Tree.prototype.levelUp = function () {
            // If there are no more leaf nodes, level up!
            if (this.current.parent !== null && this.current.parent.name !== undefined) {
                this.current = this.current.parent;
            }
        };
        Tree.prototype.expand = function (node, depth) {
            var result = '';
            // Space out based on the current depth
            for (var i = 0; i < depth; i++) {
                result += '-';
            }
            if (!node.children || node.children.length === 0) {
                result += '[' + node.name + ']';
                result += '\n';
            }
            else {
                result += '<' + node.name + '>';
                result += '\n';
                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i], depth++);
                }
            }
            return result;
        };
        Tree.prototype.toString = function () {
            var treeString = '';
            treeString = this.expand(this.root, 0);
            return treeString;
        };
        return Tree;
    })();
    COMPILER.Tree = Tree;
})(COMPILER || (COMPILER = {}));
