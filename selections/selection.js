const button = require('../buttons/button')
const canvas = button.getCanvas()

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
    
        const cmd = codes[guild][user]
        const code = cmd.code
        const tries = cmd.tries
        if (code[0] == picked) {
            if (code.length == 1) {return interaction.update({content: "You solved it! Im proud",files:[],components:[]})} 
            else {
                codes[guild][user].code = code.substring(1)
                const attachment = await canvas.new(codes[guild][user].code)
                interaction.update({files: [attachment]})
            }
        } else {
            if (tries == 1) {
                codes[guild][user] = null
                interaction.deleteReply().catch(() => console.log("LOL"))
                return interaction.reply({content: "Sorry, but you failed this captcha verification!", ephemeral: true})
            }
            codes[guild][user].tries -= 1
            return interaction.reply({content: "You have "+codes[guild][user].tries.toString()+' tries left!', ephemeral: true})
        }
    }
}