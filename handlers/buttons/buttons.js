var buttons = {}

module.exports = {
    events: {
        interactionCreate: (interaction, bot) => {
            if (!interaction.isButton()) return
            const id = interaction.customId
            var found = id
            if (buttons[id] == null) {
                for (const [k,v] of Object.entries(buttons)) {
                    if (v.contains == false) {continue}
                    if (id.includes(v.id)) {
                        found = v.id
                    }
                }
            }
            if(found == id && buttons[id] == null) {return}
            const btn = buttons[found]
            btn.execute(interaction, bot)
        }
    },
    handler: {
        path: "buttons/" // Returns a list of all .js scripts required
    },
    start: async(bot, files) => {
        files.forEach(e => {
            const button = e.button
            const id = button.id
            const contain = button.contains
            buttons[id] = {execute: e.execute, id: id,contains: contain}
        })
    }
}