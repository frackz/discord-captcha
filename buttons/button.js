const { createCanvas, loadImage } = require('@napi-rs/canvas')
const { AttachmentBuilder } = require('discord.js');
const { ActionRowBuilder, Events, SelectMenuBuilder } = require('discord.js');

const codes = {}

const canvas = {
    option: (num) => {return {label: num, description: "Is it "+num+"?", value: num}},
    int: (min, max) => {return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min))},
    random: () => {return canvas.int(10000, 99999).toString().replace('0', '1')},
    size: width => {const ratio = 35 / 200;const size = width * ratio;return `${size}px Impact`},
    new: async (text) => {
        const vas = createCanvas(200, 200)
        const ctx = vas.getContext('2d')
        ctx.font = canvas.size(vas.width)
        ctx.fillStyle = '#FFFFFF'
        text = text.split('').join(' ')
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (vas.width/2) - (textWidth / 2), vas.height/2)

        return new AttachmentBuilder(await vas.encode('png'), { name: 'captcha.png'})
    }
}

module.exports = {
    button: {
        id: 'captcha', // Needs to be this ID
        contains: false // Allow if the button's id contains this over ^^
    },
    getCodes: () => {return codes},
    getCanvas: () => {return canvas},
    execute: async(interaction, bot) => {
        const guild = interaction.guildId
        const userID = interaction.user.id
        var code = null
        if (codes[guild] == null) codes[guild] = {}
        if(codes[guild][userID] == null) {const c = canvas.random(); codes[guild][userID] = {code: c, tries: 3}; code=c} else {code = codes[guild][userID].code}
        const attachment = await canvas.new(code)


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
        

        return interaction.reply({content: "Spell out the numbers on this image.", files: [attachment], components: [row], ephemeral: true})
    }
}