const fs = require('fs')
const VariableTree = require('./n_tree.js')

class ProfanityFilter {
    /* This class holds an n-child tree to check messages against
     * for profanity. It has the functionality required to filter
     * a message, and to update the n_tree to account for changes in what is 
     * considered profanity
     */

    constructor(profanity_file) {
        // Construct profanity tree from the provided filename
        var profanityTree = new VariableTree.nTree();
        profanityTree.constructTree(profanity_file);

        /** @private */
        this._profanityTree = profanityTree;
    }

    filter(message) {
        /* Takes in a message and checks for profanity
         * 
         * This is accomplished by checking each word against our profanity
         * tree. We use a n-child tree because it has much faster time
         * complexity than a list, and we need to support checking heavy loads
         * of traffic. In order to combat corner cases which would allow bad
         * words through our filter, we do the following:
         * - Concatenate all words less than 3 characters long to the word on
         *   its left and the word on its right. This closes the loophole
         *   where a user could type a word like "T h i s" or other whitespace
         *   based formatting.
         * - If word is exactly 3 characters long, skip tree and just use
         *   includes() because the time complexity doesn't apply as much
         * 
         * @param string message : the text to be filtered
         * @return boolean : true if a bad word was found, false otherwise
         */

		const tree = this._profanityTree;
        const words = message.toLowerCase().split(' ');
        
        // If the entire message is < 3 characters total, it is not a bad word
        if(message.length < 3) {
            return false;
        }
        
        // If the message is exactly 3 characters, run simple check against
        // profanity config file
        if(message.length === 3) {
            const profanityText = fs.readFileSync('configuration/profanity.txt').toString();
            if(profanityText.includes(message)) {
                // Bad word found
                return true;
            }
            return false;
        }

		// Concatenate all words < 3 characters long as stated in docstring
		var noShortWords = false;
		do {
			noShortWords = true;
			for (var i = 0; i < words.length; i++){
					if(words[i].length < 3 && i > 0){
						noShortWords = false;
						words[i-1] += words[i];
						if(i == words.length - 1){
							words[i] = "end";
						}
					}
					if(words[i].length < 3  && i < words.length - 1){
						noShortWords = false;
						words[i] += words[i+1];
					}
			}
		} while (!noShortWords);

		//iterate thru words, checking tree for each words
		for(const word of words){
			if(tree.checkWord(word)){
                // Bad word found
                return true;
			}
        }
        return false;
    }
    
    reloadTree(profanity_file) {
        // Reconstruct profanity tree from the provided filename
        var profanityTree = new VariableTree.nTree();
        profanityTree.constructTree(profanity_file);

        /** @private */
        this._profanityTree = profanityTree;
    }
}

module.exports = {
	ProfanityFilter : ProfanityFilter,
};