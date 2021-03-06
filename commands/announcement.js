/* This module will handle our announcement command. This will take whatever message is specified
 * and send it in the channel that is specified, pinging the role specified.
 */

module.exports = {
  name: 'announcement',
  aliases: ['announce', 'announcements'],
  description: 'Announces a message, pinging a specified role. YOU MUST SPECIFY THE ROLE BY PINGING IT'
  + '\nFor example,"!ping #announcements @PingableRole This is my message."',
  usage: '<Channel Name> <@Role Name> <Message>',
  requiredArgs: 3,
  maxArgs: 1000000,
  cooldown: 5,
  execute(message, args) {
    const role = message.mentions.roles.first();
    const channelName = args[0];
    const announcement = args.slice(2).join(' ');

    const yourchannel = message.guild.channels.cache
      .find((channel) => channel.name === channelName);

    if (role.name === 'everyone' || role.name === 'here') {
      yourchannel.send('I cannot ping everyone or here with this command!');
    } else {
      yourchannel.send(`<@&${role.id}> : ${announcement}`);
    }

    return { action: 'none' };
  },
};
