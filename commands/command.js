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
					.setCustomId('captcha')
					.setLabel('Solve captcha')
					.setStyle(ButtonStyle.Success),
			);

            return interaction.reply({content: "Please solve the captcha.", components: [row]})
        }
    }
}