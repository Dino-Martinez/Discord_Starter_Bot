/*
warn with parameters as username, reason all seperated by
warn doesnt need reason
*/

/* This module will handle our warn command. */

module.exports = {
  name: 'warn',
  description: 'Warn specific user with a reason',
  aliases: [],
  requiredArgs: 1,
  maxArgs: 1000000,
  usage: '<mention | reason(optional)>',
  cooldown: 5,
  execute(message, args) {
    // creates a name and mention(list) to be used later
    const mention = message.mentions.members.first();
    const data = [];

    // if the mention exists, proceed
    if (mention) {
      data.push(mention);
    } else {
      // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help warn');
      return { action: 'none' };
    }
    // removes the mention from the list of args, then creates a string on the rest of the args list
    args.shift();
    const reason = args.join(' ');

    data.push('\nYou are being warned');
    data.push(reason);

    // Sends message in channel and return result
    message.channel.send(data, { split: true });
    message.delete();
    return { action: 'none' };
  },
};
