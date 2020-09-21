/* This module will handle our ban command. This allows staff members to
 * permanently ban users from the discord server
 */

module.exports = {
  name: 'ban',
  description: 'Ban specific user with a reason',
  aliases: [],
  requiredArgs: 2,
  maxArgs: 1000000,
  usage: '<@username> <reason>',
  cooldown: 5,
  execute(message, args) {
    const data = [];
    const target = message.mentions.members.first();
    args.shift();
    const reason = args.join(' ');

    // Check if the mention exists, if not then throw error message
    if (target) {
      data.push(target);
      data.push(`You have been banned: ${reason}`);
    } else {
      // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help ban');
      return { action: 'none' };
    }

    // TODO: Check if mentioned user is admin or mod, if so then dont ban

    // Send banned user a DM alerting them that they've been banned, then ban them
    target.send(data, { split: true });
    target.ban();

    return { action: 'ban', reason };
  },
};
