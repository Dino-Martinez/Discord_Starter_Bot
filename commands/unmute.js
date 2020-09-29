/* This module will handle our ban command. This allows staff members to
 * permanently ban users from the discord server
 */

module.exports = {
  name: 'unmute',
  description: 'Unmutes somebody who has been muted indefinitely.',
  aliases: [],
  requiredArgs: 1,
  maxArgs: 1,
  usage: '<@username>',
  cooldown: 5,
  execute(message, args) {
    const target = message.mentions.members.first();

    // Check if the mention exists, if not then throw error message
    if (target) {
      // Remove mute role from member
      const muteRole = message.guild.roles.cache.find((role) => role.name === 'Muted');
      target.roles.remove(muteRole.id);
    } else {
    // Return error and break out of code
      message.channel.send('I did not understand your request. Please use !help unmute');
      return { action: 'none' };
    }

    return { action: 'unmute' };
  },
};
