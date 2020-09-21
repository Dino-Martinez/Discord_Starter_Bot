// Prepare discord packages
const Discord = require('discord.js');

const client = new Discord.Client();

// Prepare packages for file handling
const fs = require('fs');

// Prepare Filter object to filter profanity in message handler
const profanityFile = './configuration/profanity.txt';
const FilterObject = require('./profanity_filter.js');

const Filter = new FilterObject.ProfanityFilter(profanityFile);

// Prepare discord embed builder for rich logging
const EmbedBuilder = require('./embed_builder.js');

// Retrieve necessary config data. Note: these can all change during runtime
// through the use of commands
let configData = getConfigData();
let {
  prefix, logChannelID, permissionMap, blockedMentionsList,
} = configData;

// Build collection of commands from our commands folder
// Only accept .js files, and set client command objects based on their content
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const commandFilePath = `./commands/${file}`;
  const command = require(commandFilePath);
  client.commands.set(command.name, command);
});

// Declare our collection of users on cooldown
const cooldowns = new Discord.Collection();

// Monitor when our Discord client is ready to perform actions
client.once('ready', () => {
  console.log('Ready!');
});

// Log our bot into Discord
// Note this uses the heroku environment token
// client.login(process.env.BOT_TOKEN);
const { token } = require('./environment.json');

client.login(token);

// Define helper functions

// This function logs any actions the bot takes that change the state of
// the discord server. This includes deleting messages, kicking/banning/muting
// members, etc.
function log(action, message, reason = 'None given.') {
  // Get log channel object based on config data
  const logChannel = client.channels.cache.get(logChannelID);

  // Check to make sure a message object exists if reason would require one
  if (message === {} && action !== 'deleted message') {
    logChannel.send(`I've received an error while trying to log data,
     here's what I wanted to log: ${reason}`);
    return;
  }

  // Build a Discord.js RichEmbed object with data based on reason
  const prettyLogMessage = EmbedBuilder.buildEmbed(action, reason, message);

  logChannel.send(prettyLogMessage);
}

// This function refreshes our config data
function getConfigData() {
  // Reload data from config file
  const newConfigData = JSON.parse(fs.readFileSync('./configuration/config.json'));
  const newPrefix = newConfigData.prefix;
  const newLogChannelID = newConfigData.logchannelid;
  const newBlockedMentionsList = fs.readFileSync('./configuration/blocked_mentions.txt', 'utf-8');

  // Reload data from permission map
  const newPermissionMap = JSON.parse(fs.readFileSync('./configuration/permissions_map.json'));

  // Reload profanity tree
  Filter.reloadTree(profanityFile);

  return {
    prefix: newPrefix,
    logChannelID: newLogChannelID,
    permissionMap: newPermissionMap,
    blockedMentionsList: newBlockedMentionsList.split(','),
  };
}

// Greet new members with a DM!
// TODO: make this message configurable through a command
client.on('guildMemberAdd', (member) => {
  member.send('Welcome to the server! You can see a list of my commands by typing !help');
});

// Log bans if it's done manually, rather than through a command
client.on('guildBanAdd', (guild, user) => {
  // Log our ban
  log('manual ban', user, 'Manual Ban');
});

// Listen for any message, filter profanity, then check if it is a command
client.on('message', (message) => {
  // TODOs:
  // - add configuration for ignored text channels, where the bot will
  // skip the profanity check.
  // - make this function shorter, if possible
  // - log bans and mutes even if it's done manually? should be possible

  // Check if this message was sent by a bot or in a DM
  // if so, ignore it
  if (message.author.bot || message.guild === null) {
    return;
  }

  // Check if user is moderator or admin
  const isStaff = message.member.roles.cache.find((role) => role.name.toLowerCase() === 'admin');

  // Check message for profanity, but don't check messages sent by admins and mods
  if (isStaff === undefined && Filter.filter(message.content)) {
    // Profanity found, delete the message and reply with a warning
    message.author.send(`You sent a message with profanity in ${message.guild.name}`
    + '\nI have deleted the message for you, but please try not to do it again!');
    log('profanity', message);
    message.delete();
    return;
  }

  // Check if message mentions somebody that is suppressed, if so delete message
  // Allow admins and mods to mention people even if they are suppressed
  let mentionedASuppressed = false;
  blockedMentionsList.forEach((blockedID) => {
    if (isStaff === undefined
      && message.mentions.members.find((member) => member.id === blockedID)) {
      message.delete();
      mentionedASuppressed = true;
    }
  });
  if (mentionedASuppressed) {
    return;
  }

  // Check if message is a command. If it is not, skip everything else.
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  // Message is an attempted command, get arguments and command name
  const commandArgs = message.content.slice(prefix.length).split(/ +/);
  const commandName = commandArgs.shift().toLowerCase();

  // Get command object from our discord client, accounting for command
  // aliases (i.e. having the mute command be accessible by both "mute"
  // and "silence")
  const command = client.commands.get(commandName)
    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  // If no command was found, let them know
  if (!command) {
    message.reply(`I'm sorry, I don't have any command called ${commandName}!`);
    return;
  }

  // Check if cooldown has expired. To accomplish this we establish a
  // collection of {commandName: [user1,user2,...]} that links a command with
  // its users that are on cooldown
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  // Compare current time with the last usage of this command
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  // If we have a most recent usage of command, compare times
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      // User is still on cooldown, let them know
      const timeLeft = (expirationTime - now) / 1000;
      message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      return;
    }
  } else {
    // We auto delete this most recent usage after cooldown amount to avoid
    // tracking every usage of every command
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  // Check that the appropriate number of arguments was provided
  if (command.requiredArgs > commandArgs.length || command.maxArgs < commandArgs.length) {
    message.reply(`You did not provide the correct number of arguments for the ${command.name} command!`
    + '\nThe correct usage is:\n'
    + `${prefix}${command.name} ${command.usage}`);
    return;
  }

  // Check if user has perms for command
  // Default is permission, revoke permission only if our map says to
  let hasPermission = true;

  // Check for the command in our permissions map. If the command is not
  // in our map, then permission is given. If the command is in our map,
  // then check all user roles for permission
  message.member.roles.cache.forEach((role) => {
    if (permissionMap[command.name]
        && permissionMap[command.name][role.name.toLowerCase()] === false) {
      hasPermission = false;
    }
  });

  if (!hasPermission) {
    message.reply('You do not have permission for that command!');
    return;
  }

  try {
    // Execute command
    const commandResult = command.execute(message, commandArgs);
    const commandAction = commandResult.action;
    const commandReason = commandResult.reason;

    // If state of bot is updated, then reload config data
    if (commandAction === 'update') {
      configData = getConfigData();
      prefix = configData.prefix;
      logChannelID = configData.logChannelID;
      permissionMap = configData.permissionMap;
      blockedMentionsList = configData.blockedMentionsList;
    }

    // Log results or reply with message if necessary
    if (commandAction !== 'none' && commandAction !== 'update') {
      log(commandAction, message, commandReason);
    }
  } catch (error) {
    // Respond with the error message
    console.error(error);
    message.reply(`I received this error trying to execute your command:
    ${error}`);
  }
});
