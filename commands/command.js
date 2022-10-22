const { SlashCommandBuilder } = require('@discordjs/builders')
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js')

module.exports = {
    command: {
        builder: new SlashCommandBuilder() //Insert either SlashCommandBuilder(with .toJSON() at last) or json format
            .setName("setup")
            .setDescription("Setup the captcha")
    },
    executors: {
        subs: {},
        standard: (interaction, bot) => {
            const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('solve')
					.setLabel('💡 Solve')
					.setStyle(ButtonStyle.Success),
                new ButtonBuilder()
					.setCustomId('get')
					.setLabel('🔨 Get')
					.setStyle(ButtonStyle.Secondary),
			);

            return interaction.reply({embeds: [
                {
                    "title": "Discord Captcha",
                    "description": "To proceed further, you must complete this captcha - so that we are sure you are not a bot.\n\nThis service is made by frackz, to stop bots from raiding servers. This is not a public bot, but a prototype for a (maybe) upcoming feature in a bot.\n\nYou just have to press the numbers on the picture - and then you get access to the server.",
                    "color": 3307507
                }
            ], components: [row]})
        }
    }
}