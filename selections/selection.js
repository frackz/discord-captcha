const button = require('../buttons/button')
const canvas = button.getCanvas()
const db = require('../data/handler').get()

module.exports = {
    selection: {
        id: 'solve' // Selection ID
    },
    execute: async(interaction, bot) => {
        const picked = interaction.values[0]
        const codes = button.getCodes()

        const guild = interaction.guildId
        const user = interaction.user.id

        if (codes[guild] == null || codes[guild][user] == null) return interaction.reply({content: "You do not have a active captcha verification.", ephemeral: true})
    
        const check = db.prepare('SELECT * FROM `blacklists` WHERE `user` = ?').get(user)
        if (check != null) {
            if (Date.now() < check["date"]) return interaction.reply({content: "You are currently blacklisted from Captcha - you will be un-blacklisted in: "+new Date(parseInt(check["date"])).toLocaleTimeString().replaceAll('.',':'), ephemeral: true})
            db.prepare('DELETE FROM `blacklists` WHERE `user` = ?').run(user)
        }

        const cmd = codes[guild][user]
        if (code[0] == picked) {
            if (code.length == 1) {
                codes[guild][user] = null
                return interaction.update({content: "Solved! We will be granting you the role!",files:[],components:[]})
            } else {
                codes[guild][user].completed += picked
                codes[guild][user].code = cmd.code.substring(1)
                const attachment = await canvas.new(codes[guild][user].code, codes[guild][user].completed)
                interaction.update({files: [attachment]})
            }
        } else {
            if (cmd.tries == 1) {
                codes[guild][user] = null
                db.prepare('INSERT INTO `blacklists` (`user`, `date`) VALUES (?, ?)').run(user, Date.now()+(
                    1000*60*60*3
                ))
                return interaction.update({content: "Sorry, but you failed this captcha verification! You will be blacklisted from using captcha in 3 hours!",files:[],components:[]})
            }
            codes[guild][user].tries -= 1
            const attachment = await canvas.new(codes[guild][user].code, codes[guild][user].completed)
            await interaction.update({content: "Whoops you failed - you still have "+codes[guild][user].tries+" tr(y)|(ies) back!", files: [attachment]})
            //return interaction.reply({content: "You have "+codes[guild][user].tries.toString()+' tries left!', ephemeral: true})
        }
    }
}