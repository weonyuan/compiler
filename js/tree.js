///<reference path="token.ts" />
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
            this.treeString = '';
        }
        Tree.prototype.createNode = function (name) {
            var node = {
                name: name,
                tokenType: null,
                dataType: null,
                lineNum: null,
                symbolEntry: null,
                parent: {},
                children: []
            };
            return node;
        };
        Tree.prototype.addNode = function (name, nodeType, token) {
            var node = this.createNode(name);
            if (token !== null) {
                node.tokenType = token.getType();
                if (nodeType === LEAF_NODE) {
                    node.lineNum = token.getLineNum();
                }
            }
            // Check to see if the node is a root node
            if (this.root === null || !this.root) {
                this.root = node;
            }
            else {
                node.parent = this.current;
                this.current.children.push(node);
            }
            if (nodeType === BRANCH_NODE) {
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
            }
            else {
                // Otherwise, encapsulate in angle brackets
                this.treeString += '&lt;' + node.name + '&gt;</div>';
                this.treeString += '\n';
                // Recursively traverse through the children nodes
                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i], depth + 1);
                }
            }
            return this.treeString;
        };
        Tree.prototype.printTreeString = function (location) {
            this.treeString = this.expand(this.root, 0);
            document.getElementById(location).innerHTML = this.treeString;
        };
        return Tree;
    })();
    COMPILER.Tree = Tree;
})(COMPILER || (COMPILER = {}));
