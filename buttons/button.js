const { createCanvas, loadImage } = require('@napi-rs/canvas')
const { AttachmentBuilder } = require('discord.js');
const { ActionRowBuilder, Events, SelectMenuBuilder } = require('discord.js');
const db = require('../data/handler').get()

const codes = {}

const canvas = {
    option: (num) => {return {label: num, description: "Is it "+num+"?", value: num}},
    int: (min, max) => {return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min))},
    random: () => {return canvas.int(10000, 99999).toString().replaceAll('0', '1')},
    size: width => {const ratio = 35 / 200;const size = width * ratio;return `${size}px Impact`},
    text: (ctx, vas, x, text, color) => {
        ctx.font = canvas.size(vas.width)
        ctx.fillStyle = color
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, x, vas.height/2)
        return [ctx, textWidth]
    },
    new: async (text, completed = '') => {
        const vas = createCanvas(200, 200)

        var ctx = vas.getContext('2d')

        var x = 60
        completed.split("").forEach(w => {
            const resp = canvas.text(ctx, vas, x, w, '#00FF00')
            ctx = resp[0]
            x += resp[1]
        });
        text.split("").forEach(w => {
            const resp = canvas.text(ctx, vas, x, w, '#FFFFFF')
            ctx = resp[0]
            x += resp[1]
        });

        return new AttachmentBuilder(await vas.encode('png'), { name: 'captcha.png'})
    }
}

module.exports = {
    button: {
        id: 'solve', // Needs to be this ID
        contains: false // Allow if the button's id contains this over ^^
    },
    getCodes: () => {return codes},
    getCanvas: () => {return canvas},
    execute: async(interaction, bot) => {
        const guild = interaction.guildId
        const userID = interaction.user.id

        const check = db.prepare('SELECT * FROM `blacklists` WHERE `user` = ?').get(userID)
        if (check != null) {
            if (Date.now() < check["date"]) return interaction.reply({content: "You are currently blacklisted from Captcha - you will be un-blacklisted: "+new Date(parseInt(check["date"])).toLocaleTimeString().replaceAll('.',':'), ephemeral: true})
            db.prepare('DELETE FROM `blacklists` WHERE `user` = ?').run(userID)
        }

        var code = null
        if (codes[guild] == null) codes[guild] = {}
        if(codes[guild][userID] == null) {const c = canvas.random(); codes[guild][userID] = {code: c, tries: 3, completed: ''}; code=c} else {code = codes[guild][userID].code}
        const attachment = await canvas.new(code, '')


        const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('solve')
					.setPlaceholder('Select number!')
					.addOptions(
						canvas.option("1"),
                        canvas.option("2"),
                        canvas.option("3"),
                        canvas.option("4"),
                        canvas.option("5"),
                        canvas.option("6"),
                        canvas.option("7"),
                        canvas.option("8"),
                        canvas.option("9"),
					),
			);
        

        return interaction.reply({embeds: [
            {
                "title": "Please solve the captcha",
                "description": "Welcome, this is the captcha page - there is an image below this message. You just have to insert the numbers that are in the picture.\n\nIf you fail 3 times, you will be banned for 3 hours for captcha.\n\nSo think about it, and if we find out you are using bot accounts you will be banned.",
                "color": 3321331,
                "image": {
                  "url": "attachment://captcha.png"
                }
            }
        ], files: [attachment], components: [row], ephemeral: true})
    }
}