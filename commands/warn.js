/* This module will handle our warn command. This allows a staff member
 * to warn a user for breaking the rules without enacting a punishment.
 * It will ping the user in the channel that the message was sent in, and
 * remove the warn message itself. This allows warnings to be logged in our
 * log channel.
 */

module.exports = {
  name: 'warn',
  description: 'Warn specific user with a reason',
  aliases: [],
  requiredArgs: 1,
  maxArgs: 1000000,
  usage: '<@username> <reason - optional>',
  cooldown: 5,
  execute(message, args) {
    const mention = message.mentions.members.first();
    const data = [];

    // Check if the mention exists, if not then throw an error
    if (mention) {
      data.push(mention);
    } else {
      // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help warn');
      return { action: 'none' };
    }

    // TODO: Check if mentioned user is admin or mod, if so then dont warn

    // Retrieve the reason from our list of args
    args.shift();
    const reason = args.join(' ') || 'No reason given';

    // Build warning message, pinging them and saying they are warned
    data.push('\nYou are being warned for:');
    data.push(reason);

    // Sends message in channel and return result
    message.channel.send(data, { split: true });
    message.delete();
    return { action: 'warn', reason };
  },
};
