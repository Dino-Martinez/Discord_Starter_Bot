class CharNode {
	/* This class represents a single character node in a Tree, where its
	 * value is a single character, and it can have any number of children
	 * Nodes.
	 */

	constructor(char) {
		// Initialize instance variables
		this.character = char;
		this.childrenDict = {};
	}

	addChild(char) {
		// Check if given character is already in children,
		// if it is not then hash and push
		if(!(char.charCodeAt() in this.childrenDict)) {
			this.childrenDict[asciiHash(char)] = new CharNode(char);
			return this.childrenDict[asciiHash(char)];
		}
	}

	findChild(char) {
		// Find given character in children list
		return this.childrenDict[char.charCodeAt()];
	}

	isLeafNode() {
		// Returns true if this Node is a leaf (i.e. if it has no children)
		return this.childrenDict === {};
	}

	printDescending() {
		// Recursively prints all Nodes in the tree
		// TODO: write pretty print function
		console.log(this.character);
		if(this.childrenDict !== {}) {
			for(const child in this.childrenDict) {
				this.childrenDict[child].printDescending();
			}
		}
	}
}

module.exports = {
	CharNode : CharNode,
};
function asciiHash(char) {
	return char.charCodeAt();
}