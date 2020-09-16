const Discord = require('discord.js');
const {themeColor} = require('./configuration/config.json');
module.exports =  {
    buildEmbed(reason, message) {
        // Build RichEmbed default values
        var embed = new Discord.MessageEmbed()
        embed.setColor(themeColor).setTimestamp(new Date()).setFooter('Courtesy of Starter Bot™');
        var title = '';
        var authorName = '';
        var {fieldOne,fieldTwo,fieldThree} = [];

        // Build embed data based on reason and message
        // TODO: log bans and mutes
        switch(reason) {
            case "profanity":
                title = `I deleted a message.`;
                authorName = `| ${message.author.username} |`
                fieldOne = [
                    'User:',
                    `${message.author}`,
                    true];
                fieldTwo = [
                    'Reason:',
                    `Sending a message containing profanity.
                    The message was deleted from ${message.channel}.`,
                    true];
                fieldThree = [
                    'Deleted Message:',
                    `${message.content}`,
                    false];
                break;
            case "mute":
                break;
            case "ban":
                break;
        }

        // Set embed data
        embed.setTitle(title)
        .addField(
            fieldOne[0],
            fieldOne[1],
            fieldOne[2])
            .addField(
            fieldTwo[0],
            fieldTwo[1],
            fieldTwo[2])
            .addField(
            fieldThree[0],
            fieldThree[1],
            fieldThree[2]);
        
        return embed;
    }
}