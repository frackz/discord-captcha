const button = require('../buttons/button')
const canvas = button.getCanvas()
const db = require('../data/handler').get()

const errorCodes = {
    2: '15987506',
    1: '15955762'
}

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
        if (cmd.code[0] == picked) {
            if (cmd.code.length == 1) {
                codes[guild][user] = null
                return interaction.update({content: "Solved! We will be granting you the role!",files:[],components:[]})
            } else {
                codes[guild][user].completed += picked
                codes[guild][user].code = cmd.code.substring(1)
                const attachment = await canvas.new(codes[guild][user].code, codes[guild][user].completed)
                var embed = interaction.message.embeds[0]

                interaction.update({embeds:[{
                    title: embed['title'],
                    description: embed['description'],
                    color: embed['color'],
                    image: {
                        url: "attachment://captcha.png"
                    }
                }],files: [attachment]})
            }
        } else {
            if (cmd.tries == 1) {
                const date = Date.now()+(
                    1000*60*60*3
                )
                codes[guild][user] = null
                db.prepare('INSERT INTO `blacklists` (`user`, `date`) VALUES (?, ?)').run(user, date)
                return interaction.update({
                    embeds:[
                        {
                            "title": "Whoops, you failed!",
                            "description": "You failed the captcha - in the end you are a robot, or very bad at seeing numbers.\n\nAs said, if you fail a captcha you will be banned for 3 hours.\n\nYou will be allowed to use the captcha again in 3 hours, aka the clock: **"+new Date(date).toLocaleTimeString().replaceAll(".", ":")+"**",
                            "color": 15737892
                        }
                    ],files:[],components:[]})
            }
            codes[guild][user].tries -= 1
            var embed = interaction.message.embeds[0]

            console.log(embed['title'])

            await interaction.update({embeds: [
                {
                    title: embed['title'].split(" | ")[0] + ' | Tries left: '+codes[guild][user].tries,
                    description: embed['description'],
                    color: errorCodes[codes[guild][user].tries],
                    image: embed['image']
                }
            ], files: []})
            //return interaction.reply({content: "You have "+codes[guild][user].tries.toString()+' tries left!', ephemeral: true})
        }
    }
}