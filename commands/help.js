const { prefix } = require('../configuration/config.json');

/* This module will handle our help command. The purpose of this command is to
 * provide a Discord user with a list of our Bot's commands, or with a 
 * description of whatever command they specify.
 */

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  requiredArgs: 0,
  maxArgs: 1,
  usage: '<command name | optional>',
  cooldown: 5,
  execute(message, args) {
    // Retrieve list of commands from our client, and prepare our return data
    const { commands } = message.client;
    let data = [];

    if (!args.length) {
      // If no command was specified, display list of commands
      data.push('Here\'s a list of all my commands:');
      data.push(commands.map((command) => command.name).join(', '));
      data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);
    } else {
      // If a command was specified, display data on that command
      const name = args[0].toLowerCase();
      const command = commands.get(name)
        || commands.find((c) => c.aliases && c.aliases.includes(name));

      if (!command) {
        data.push("I couldn't find any info on that command!");
      } else {
        // Build command info
        data.push(`\n**Name:** ${command.name}`);
        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
      }
    }

    // Reply with our return data, then return the result
    message.reply(data, { split: true });
    return { action: 'none' };
  },
};
