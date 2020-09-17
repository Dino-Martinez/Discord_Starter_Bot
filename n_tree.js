const fs = require('fs');
const Nodes = require('./char_node.js');

const specialChars = {
  '@': 'a',
  7: 't',
  1: 'l',
  3: 'e',
  4: 'a',
  5: 's',
};

class nTree {
  /* This class represents a tree of character nodes, each with a variable
   * number of children. For our purposes on this project we will use it to
   * store all words considered profanity.
   */

  constructor() {
    // Initialize the root of our tree. This will be the only node that
    // is more than a single character.
    this.root = new Nodes.CharNode('root');
  }

  constructTree(inputFile) {
    let currentNode = this.root;

    // Create array of bad words split by line from input file
    const text = fs.readFileSync(inputFile, 'utf-8');
    const textByLine = text.split(',');

    // Iterate over each word, then each letter within each word, adding words to
    // the tree, letter by letter
    textByLine.forEach((word) => {
      currentNode = this.root;
      word.trim().split('').forEach((character) => {
        currentNode.addChild(character);
        currentNode = currentNode.findChild(character);
      });
    });
  }

  // returns true if the word is bad
  checkWord(word) {
    let isPrefix = true;
    let prefixEnding = 0;
    let currentNode = this.root;
    let count = 1.0;
    let isBadWord = false;
    word.trim().split('').forEach((char) => {
      // replace special characters with normal characters
      let character = char;
      character = (specialChars[character] ? specialChars[character] : character);
      if (currentNode.findChild(character)) {
        isPrefix = false;
        currentNode = currentNode.findChild(character);
        if (((count - prefixEnding) / word.length) >= 0.66) {
          isBadWord = true;
        }
      } else {
        if (!isPrefix) {
          isBadWord = false;
        }
        prefixEnding = count;
      }
      count += 1;
    });
    return isBadWord;
  }

  printTree() {
    this.root.printDescending();
  }
}

module.exports = {
  nTree,
};
