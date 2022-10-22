const db = require('../data/handler').get() // get db
module.exports = {
    
    button: {
        id: 'get',
        contains: false
    },
    execute: (interaction, bot) => {
        const ggg = db.prepare('SELECT * FROM `guilds` WHERE `guild` = ?').get(
            interaction.guildId
        )
        
        if (ggg == null) {
            return interaction.reply({content: "Oops! We are sorry - the server owner didn't setup the roles yet, please contact the server owner to get this fixed!", ephemeral: true})
        }
        
        let role = interaction.guild.roles.cache.find(r => r.id === ggg.role);
        if (role == null) {
            return interaction.reply({content: "Oops! We cannot find the captcha role!", ephemeral: true})
        }

        interaction.member.roles.add(role).catch(() => {
            return interaction.reply({content: "We dont have permissions to give you the role!", ephemeral: true})
        }).then(() => {
            return interaction.reply({content: "You now got them roles", ephemeral: true})
        })
    }
}