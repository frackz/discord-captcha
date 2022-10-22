const button = require('../buttons/button')
const canvas = button.getCanvas()
const db = require('../data/handler').get()

const errorCodes = {2: '15987506',1: '15955762'}

module.exports = {
    selection: {
        id: 'solve'
    },
    execute: async(interaction, bot) => {
        const picked = interaction.values[0]
        const codes = button.getCodes()

        const guild = interaction.guildId
        const user = interaction.user.id

        const embed = interaction.message.embeds[0]

        if (codes[guild] == null || codes[guild][user] == null) return interaction.reply({content: "You do not have a active captcha verification.", ephemeral: true})
    
        const check = db.prepare('SELECT * FROM `blacklists` WHERE `user` = ?').get(user)
        if (check != null) {if (Date.now() < check["date"]) return interaction.reply({content: "You are currently blacklisted from Captcha - you will be un-blacklisted in: "+new Date(parseInt(check["date"])).toLocaleTimeString().replaceAll('.',':'), ephemeral: true}); db.prepare('DELETE FROM `blacklists` WHERE `user` = ?').run(user)}
        
        const save = db.prepare('SELECT * FROM `saves` WHERE `user` = ? AND `guild` = ?').get(user,guild)
        if (save != null) return interaction.reply({content: "You already completed this captcha!", ephemeral: true})



        const cmd = codes[guild][user]
        if (cmd.code[0] == picked) {
            if (cmd.code.length == 1) {
                codes[guild][user] = null // removes the user from captcha list 

                const ggg = db.prepare('SELECT * FROM `guilds` WHERE `guild` = ?').get(guild)

                if (ggg == null) {return interaction.reply({content: "Oops! We are sorry - the server owner didn't setup the roles yet, please contact the server owner to get this fixed!", ephemeral: true})}

                let role = interaction.guild.roles.cache.find(r => r.id === ggg.role);
                if (role == null) {return interaction.reply({content: "Oops! We cannot find the captcha role!", ephemeral: true})}

                interaction.member.roles.add(role).catch(() => {return interaction.reply({content: "We dont have permissions to give you the role!", ephemeral: true})})
                .then(() => {
                    db.prepare('INSERT INTO `saves` (`user`, `guild`) VALUES (?,?)').run(user, guild)
                    try {return interaction.update({embeds:[{"title": "Success, you are good!","description": "Luckily (we hope) you're not a robot. If you are, stop :(\n\nYou have now been given the role that an administrator has told us to give you.", "color": 2420780}],files:[],components:[]})} catch {}
                })


            } else {
                codes[guild][user].completed += picked
                codes[guild][user].code = cmd.code.substring(1)
                const attachment = await canvas.new(codes[guild][user].code, codes[guild][user].completed)

                interaction.update({embeds:[{title: embed['title'],description: embed['description'],color: embed['color'],image: {url: "attachment://captcha.png"}}],files: [attachment]})
            }
        } else {
            if (cmd.tries == 1) {
                const date = Date.now()+(1000*60*60*3)

                codes[guild][user] = null

                db.prepare('INSERT INTO `blacklists` (`user`, `date`) VALUES (?, ?)').run(user, date)
                return interaction.update({embeds:[{"title": "Whoops, you failed!","description": "You failed the captcha - in the end you are a robot, or very bad at seeing numbers.\n\nAs said, if you fail a captcha you will be banned for 3 hours.\n\nYou will be allowed to use the captcha again in 3 hours, aka the clock: **"+new Date(date).toLocaleTimeString().replaceAll(".", ":")+"**","color": 15737892}],files:[],components:[]})
            }
            codes[guild][user].tries -= 1
            await interaction.update({embeds: [{title: embed['title'].split(" | ")[0] + ' | Tries left: '+codes[guild][user].tries,description: embed['description'],color: errorCodes[codes[guild][user].tries],image: embed['image']}], files: []})
        }
    }
}