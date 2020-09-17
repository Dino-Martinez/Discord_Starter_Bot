const { builtinModules } = require("module");

module.exports = {
    name: 'help',
	description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    requiredArgs: 0,
    maxArgs: 1,
	usage: '<command name | optional>',
    cooldown: 5,
    execute (message, args) {
        const { commands } = message.client;
        var data = [];
		if (!args.length) {
            // If no command was specified, display list of commands
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);
        } else {
            // If a command was specified, display data on that command
            const name = args[0].toLowerCase();
            const command = commands.get(name) 
                || commands.find(c => c.aliases && c.aliases.includes(name));

            if(!command) {
                data.push("I couldn't find any info on that command!");
            } else {
                // Build command info
                data.push(`\n**Name:** ${command.name}`);
                if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
                if (command.description) data.push(`**Description:** ${command.description}`);
                if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
            }

        }

		message.reply(data, { split: true });
        return {"action": "none"};
    }
}