/*
    This module will handle our mute command, this allows staff members
    to mute people within the channel with a specified duration
*/
module.exports = {
  name: 'mute',
  description: 'mute specific user with a reason',
  aliases: [],
  requiredArgs: 2,
  maxArgs: 1000000,
  usage: '<@username> <reason> <duration>',
  cooldown: 5,
  execute(message, args) {
    const data = [];
    const target = message.mentions.members.first();
    args.shift();
    const reason = args.join(' ');
    const duration = args.pop();
    console.log(duration);
    const time = 'One minute'; // figure out algorithm for converting time

    //m, s, h
    // TODO: Check if mentioned user is admin or mod, if so then dont ban

    // Check if the mention exists, if not then throw error message
    if (target) {
      data.push(target);
      data.push(`You have been muted: ${reason} for ${time}`);
    } else {
      // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help mute');
      return { action: 'none' };
    }
    // Send banned user a DM alerting them that they've been banned, then ban them
    target.send(data, { split: true });

    return { action: 'mute', reason };
  },
};
