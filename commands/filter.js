const fs = require('fs');

/* This module will handle our filter command. This allows Moderators
 * and Admins to update the blacklist for what is and isn't considered profanity.
 */

module.exports = {
  name: 'filter',
  aliases: ['blacklist', 'profanity'],
  description: 'Updates profanity blacklist as specified.',
  usage: '<list | add | remove> <word to add/remove>',
  requiredArgs: 1,
  maxArgs: 2,
  cooldown: 0,
  execute(message, args) {
    const actionToDo = args[0];
    let profanity = fs.readFileSync('./configuration/profanity.txt', 'utf-8');
    let returnAction = 'none';

    if (actionToDo.toLowerCase() === 'list') {
      // Print list of config variables. We have used descriptive names for
      // these variables, so no need to explain them
      message.channel.send(`Here are all the words currently blacklisted:\n${profanity}`);
    } else {
      // Update the profanity text file accordingly
      if (actionToDo.toLowerCase() === 'add') {
        profanity += `${args[1].toLowerCase()},`;
      } else if (actionToDo.toLowerCase() === 'remove') {
        profanity = profanity.replace(`${args[1].toLowerCase()},`, '');
      }
      fs.writeFileSync('./configuration/profanity.txt', profanity);
      message.channel.send('I have updated the profanity file accordingly!');
      returnAction = 'update';
    }

    return { action: returnAction };
  },
};
