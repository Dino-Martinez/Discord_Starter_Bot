// Prepare discord packages
const Discord = require('discord.js');
const client = new Discord.Client();

// Retrieve necessary config data. Note: these can all change during runtime
// through the configure command
var { prefix, logChannelID } 
    = require('./configuration/config.json');

// Prepare Filter object to filter profanity in message handler
const FilterObject = require('./profanity_filter.js');
const Filter = new FilterObject.ProfanityFilter('./configuration/profanity.txt');

// Prepare discord embed builder for rich logging
const EmbedBuilder = require('./embed_builder.js');

// Prepare packages for file handling
const fs = require('fs');

// Build collection of commands from our commands folder
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands')
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Monitor when our Discord client is ready to perform actions
client.once('ready', () => {
	console.log('Ready!');
});

// Log our bot into Discord
// Note this uses the heroku environment token
// client.login(process.env.BOT_TOKEN);
const { token } = require('./environment.json');
client.login(token);

// Greet new members with a DM!
// TODO: make this message configurable through a command
client.on("guildMemberAdd", member => {
    member.send("Welcome to the server! You can see a list of my commands by typing !help");
});

// Listen for any message
client.on("message", message => {
    // TODO: add configuration for ignored text channels, where the bot will
    // skip the profanity check

    // Check message for profanity
    if(Filter.filter(message.content)) {
        // Profanity found, delete the message and reply with a warning
        message.reply("No bad words allowed!");
        log("profanity", message);
        message.delete();
    }

    // Check if message is a command 
    //  Check if user has perms for command
});

// This function logs any actions the bot takes that change the state of
// the discord server. This includes deleting messages, kicking/banning/muting
// members, etc.
function log(reason, message={}) {
    // Get log channel object based on config data
    const logChannel = client.channels.cache.get(logChannelID);

    // Check to make sure a message object exists if reason would require one
    if (message === {} && reason !== "profanity") {
        logChannel.send(`I've received an error while trying to log data,
         here's what I wanted to log: ${reason}`);
        return;
    }
    
    // Build a Discord.js RichEmbed object with data based on reason
    const prettyLogMessage = EmbedBuilder.buildEmbed(reason, message);

    logChannel.send(prettyLogMessage);
    return;
}


 /* TODOS (rest of project):
  * set up starter configuration data
  * create command files
  * test everything
  */
