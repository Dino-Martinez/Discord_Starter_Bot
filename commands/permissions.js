const fs = require('fs');

/* This module will handle our permissions command. This allows Moderators
 * and Admins to change which roles have permission to use which commands.
 */

module.exports = {
  name: 'permissions',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['perms'],
  requiredArgs: 1,
  maxArgs: 1000000,
  usage: '<list | update> <command name> <add | remove> <role name>',
  cooldown: 5,
  execute(message, args) {
    const actionToDo = args[0];
    const permissionMap = JSON.parse(fs.readFileSync('./configuration/permissions_map.json'));

    if (actionToDo.toLowerCase() === 'list') {
      // List out our current map of permissions
      let replyString = '';
      Object.keys(permissionMap).forEach((command) => {
        replyString += `${command}: `;
        Object.keys(permissionMap[command]).forEach((role) => {
          replyString += `${role} `;
          if (permissionMap[command][role]) {
            replyString += '*does* have permission to use this. ';
          } else {
            replyString += '*does not* have permission to use this. ';
          }
        });
        replyString += '\n';
      });
      message.channel.send(replyString);
    } else if (actionToDo.toLowerCase() === 'update') {
      const commandName = args[1];
      const addOrRemove = args[2];
      const roleName = args[3];

      // Update our permissions map
      if (addOrRemove === 'add') {
        permissionMap[commandName][roleName] = true;
        fs.writeFileSync('./configuration/permissions_map.json', JSON.stringify(permissionMap));
      } else if (addOrRemove === 'remove') {
        permissionMap[commandName][roleName] = false;
        fs.writeFileSync('./configuration/permissions_map.json', JSON.stringify(permissionMap));
      } else {
        message.channel.send('I did not understand your request. Please use !help perms');
      }
    } else {
      message.channel.send('I did not understand your request. Please use !help perms');
    }

    return { action: 'none' };
  },
};
