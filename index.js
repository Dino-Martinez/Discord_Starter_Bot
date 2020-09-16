// Load Filter object to filter profanity in message handler
const FilterObject = require('./profanity_filter.js');
const Filter = new FilterObject.ProfanityFilter('./configuration/profanity.txt');

/* TODOS (in this file):
 * login bot
 * load configuration data
 * load command modules
 * define handlers: 
 *   greet - send hello message,
 *   inspect_message - filter profanity/execute commands
 */

 /* TODOS (rest of project):
  * set up starter configuration data
  * create command files
  * test everything
  */
