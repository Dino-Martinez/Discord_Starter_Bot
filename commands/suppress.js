const fs = require('fs');

/* This module will handle our suppress command. This allows Moderators and Admins to
 * specify users that are not allowed to be pinged. we will then have a separate area
 * delete any message that pings anyone on the list.
 */

module.exports = {
  name: 'suppress',
  description: 'Allows you to specify users who may not be pinged.',
  aliases: ['block-mention'],
  requiredArgs: 1,
  maxArgs: 3,
  usage: '<list | add | remove> <user name>',
  cooldown: 5,
  execute(message, args) {
    const actionToDo = args[0];
    let blockedMentionsText = fs.readFileSync('./configuration/blocked_mentions.txt', 'utf-8');
    const blockedMentionsList = blockedMentionsText.split(',');
    let returnAction = 'none';

    // Remove the blank element at the end caused by trailing commas
    blockedMentionsList.pop();
    if (actionToDo.toLowerCase() === 'list') {
      // List out our current map of permissions
      let replyString = 'Here is a list of members who cannot be mentioned:\n';
      blockedMentionsList.forEach((userID) => {
        const user = message.guild.members.cache.find((guildMember) => guildMember.id === userID);
        replyString += `${user.displayName} `;
        replyString += '\n';
      });
      message.channel.send(replyString);
    } else {
      // Update our txt file accordingly
      const specifiedUserID = message.mentions.members.first().id;
      if (actionToDo.toLowerCase() === 'add') {
        // Add specified word to our file
        if (specifiedUserID === undefined) {
          message.channel.send('Please tag the person you want to suppress by typing @<username>');
          return { action: returnAction };
        }
        blockedMentionsText += `${specifiedUserID},`;
      } else if (actionToDo.toLowerCase() === 'remove') {
        // Remove specified user from our file
        blockedMentionsText = blockedMentionsText.replace(`${specifiedUserID},`, '');
      }
      fs.writeFileSync('./configuration/blocked_mentions.txt', blockedMentionsText);
      message.channel.send('I have updated my configuration accordingly');
      returnAction = 'update';
    }

    return { action: returnAction };
  },
};
