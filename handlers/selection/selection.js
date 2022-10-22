var selections = {}

module.exports = {
    events: {
        interactionCreate: (interaction, bot) => {
            if (!interaction.isSelectMenu()) return
            const id = interaction.customId
            if (selections[id] == null) return
            const selection = selections[id]
            selection.execute(interaction, bot)
        }
    },
    handler: {
        path: "selections/" // Returns a list of all .js scripts required
    },
    start: async(bot, files) => {
        files.forEach(e => {
            const selection = e.selection
            const id = selection.id
            selections[id] = {execute: e.execute, id: id}
        })
    }
}