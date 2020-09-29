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
    function toMilliseconds(duration) { // will convert mute duration into milliseconds
      const stringDuration = String(duration);
      const durationNumber = stringDuration.substring(0, duration.length - 1);
      const durationScale = stringDuration.substring(duration.length - 1);
      console.log(`Duration: ${durationNumber} | Scale: ${durationScale}`);
      if (durationScale === 'm') return durationNumber * 60000;
      if (durationScale === 'h') return durationNumber * 36000000;
      if (durationScale === 's') return durationNumber * 1000;
    }
    const target = message.mentions.members.first();
    args.shift(); // after taking the mention, remove it from args array
    let reason = args.join(' ');

    // Check if the mention exists, if not then throw error message
    if (!target) {
      message.channel.send('The mentioned user does not exist!');
      return { action: 'none' };
    }

    // Check if mentioned user is admin or mod, if so then dont mute
    const isStaff = target.roles.cache.find((role) => role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'moderator');
    if (isStaff) {
      message.channel.send('You cannot mute staff members.');
      return { action: 'none' };
    }

    let muteDuration = -9999;
    const durationFormat = /[0-9]+\D/i;

    args.forEach((argument) => {
      if (argument.match(durationFormat)) {
        muteDuration = argument;
        reason = reason.replace(muteDuration, '');
        console.log(reason);
      }
    });

    let muteRole = message.guild.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
    if (!muteRole) {
      try {
        muteRole = message.guild.createRole({
          name: 'Muted',
          color: '#000000',
          permissions: [],
        });
        message.guild.channels.forEach((channel, id) => {
          channel.overwritePermissions(muteRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
          });
        });
      } catch (e) {
        console.log(e.stack);
      }
    }

    if (muteDuration === -9999) {
      // indefinite mute
      target.roles.add(muteRole.id);
      message.channel.send(`<@${target.id}> has been muted until further notice.`);
      target.send(`You have been muted in ${message.guild.name} for::\n ${reason}`);
      return { action: 'mute', reason };
    }
    // duration mute
    target.roles.add(muteRole.id);
    message.channel.send(`<@${target.id}> has been muted for ${muteDuration} for the following reason: ${reason}`);
    target.send(`You have been muted in ${message.guild.name} for ${muteDuration} for:\n ${reason}`);
    // unmute after duration
    setTimeout(() => {
      try {
        target.roles.remove(muteRole.id);
        message.channel.send(`<@${target.id}> has been unmuteddddD!`);
        // Send muted user a DM alerting them that they've been muted
        target.send(`You have been unmuteddddd in ${message.guild.name}!`);
      } catch (err) {
        console.log('Member left the server');
      }
    }, toMilliseconds(muteDuration));
    return { action: 'mute', reason };
  },
};
