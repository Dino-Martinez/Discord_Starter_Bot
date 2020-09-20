/* This module will handle our configure command. This allows moderators and admins to configure
 * the bot from a command, rather than having to edit config.json themself. 
 */
const fs = require('fs');

module.exports = {
  name: 'configure',
  description: 'Edit my configuration variables to pertain to your server.',
  aliases: ['config', 'edit'],
  requiredArgs: 1,
  maxArgs: 3,
  usage: '<list | update> <variable name> <new value>',
  cooldown: 0,
  execute(message, args) {
    const actionToDo = args[0];
    const data = [];
    const configurationVariables = JSON.parse(fs.readFileSync('./configuration/config.json'));
    let returnAction = 'none';

    if (actionToDo.toLowerCase() === 'list') {
      // Print list of config variables. We have used descriptive names for
      // these variables, so no need to explain them
      data.push('Here is a list of my configuration variables: ');
      Object.keys(configurationVariables).forEach((variable) => {
        data.push(`${variable}: ${configurationVariables[variable]}`);
      });
      message.channel.send(data);
    } else {
      // Parse the rest of their command and update the variable with the
      // new value.
      const variableName = args[1].toLowerCase();
      const newValue = args[2];

      // TODO: santize data before storing it. Ensure themecolor is a hex code, etc
      configurationVariables[variableName] = newValue;
      fs.writeFileSync('./configuration/config.json', JSON.stringify(configurationVariables));
      message.channel.send('I have updated the config file accordingly!');
      returnAction = 'update';
    }

    return { action: returnAction };
  },
};
