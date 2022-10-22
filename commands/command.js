const { SlashCommandBuilder } = require('@discordjs/builders')
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js')
const db = require('../data/handler').get() // get db

module.exports = {
    command: {
        builder: new SlashCommandBuilder()
            .setName("setup")
            .setDescription("Setup Captcha")
            .addSubcommand(subcommand => subcommand.setName("message").setDescription("Setup the captcha message"))
            .addSubcommand(subcommand => subcommand.setName("role").setDescription("Setup the captcha role").addRoleOption(opt => opt.setName("role").setDescription("The captcha role").setRequired(true)))
    },
    executors: {
        subs: {
            "role": (interaction, bot) => {
                if (interaction.user.id != interaction.guild.ownerId) return interaction.reply({content: "You are not the owner of the server.", ephemeral: true})
                const role = interaction.options.getRole("role")
                
                const data = db.prepare('SELECT * FROM `guilds` WHERE `guild` = ?').get(interaction.guildId)
                
                if (data == null) {db.prepare('INSERT INTO `guilds` (`guild`, `role`) VALUES (?, ?)').run(interaction.guildId,role.id)} 
                else {db.prepare('UPDATE `guilds` SET `role` = ? WHERE `guild` = ?').run(role.id,interaction.guildId)}
                
                return interaction.reply({content: "Updated the captcha role to <@&"+role.id+">", ephemeral: true})
            },
            "message": (interaction, bot) => {
                if (interaction.user.id != interaction.guild.ownerId) return interaction.reply({content: "You are not the owner of the server.", ephemeral: true})

                const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('solve').setLabel('💡 Solve Captcha').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('get').setLabel('🔨 Get Roles').setStyle(ButtonStyle.Secondary),);

                interaction.reply({content: "Success!", ephemeral: true})

                return interaction.channel.send({embeds: [{"title": "Discord Captcha","description": "To proceed further, you must complete this captcha - so that we are sure you are not a bot.\n\nThis service is made by frackz, to stop bots from raiding servers. This is not a public bot, but a prototype for a (maybe) upcoming feature in a bot.\n\nYou just have to press the numbers on the picture - and then you get access to the server.","color": 3307507}], components: [row]})
            }
        },
        standard: null
    }
}