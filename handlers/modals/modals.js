var modals = {}

module.exports = {
    events: {
        interactionCreate: (interaction, bot) => {
            if (!interaction.isModalSubmit()) return
            const id = interaction.customId
            if (modals[id] == null) return
            const modal = modals[id]
            modal.execute(interaction, bot)
        }
    },
    handler: {
        path: "modals/" // Returns a list of all .js scripts required
    },
    start: async(bot, files) => {
        files.forEach(e => {
            const modal = e.modal
            const id = modal.id
            modals[id] = {execute: e.execute, id: id}
        })
    }
}