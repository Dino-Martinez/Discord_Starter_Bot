/* This module will handle our ban command */

module.exports = {
  name: 'ban',
  description: 'Ban specific user with a reason',
  aliases: [],
  requiredArgs: 2,
  maxArgs: 1000000,
  usage: '<mention | reason>',
  cooldown: 5,
  execute(message, args) {
    // creates variables for data to be returned, mention, and reason of ban
    const data = [];
    const target = message.mentions.members.first();
    args.shift();
    const reason = args.join(' ');
    // if the mention exists, proceed
    if (target) {
      data.push(target);
      data.push(`You have been banned: ${reason}`);
    } else {
      // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help ban');
      return { action: 'none' };
    }
    // pushes a message to the specified user's DM alerting them that they got the ban hammer
    (target).send(data, { split: true });
    // finds the targets ID in order to ban a user
    target.ban();
    return { action: 'ban', reason };
  },
};
