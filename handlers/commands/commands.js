const { Routes } = require('discord.js')
const { REST } = require('@discordjs/rest')

var commands = {}

module.exports = {
    events: {
        interactionCreate: (interaction, bot) => {
            if (!interaction.isCommand()) return
            const command = interaction.commandName
            var sub
            try {
                sub = interaction.options.getSubcommand()
            } catch {}
            if (commands[command] == null) return
            const executors = commands[command]
            const subs = executors.subs
            if (sub == null) {
                return executors.standard(interaction, bot)
            } else {
                if (subs[sub] == null) return console.log("User tried executing command "+command+" with sub "+sub+" but failed because sub wasn't defined")
                subs[sub](interaction, bot)
            }
        }
    },
    handler: {
        path: "commands/" // Returns a list of all .js scripts required
    },
    start: async(bot, files) => {
        //
        const rest = new REST({ version: '10' }).setToken(bot.token)
        var data = []
        files.forEach(e => {
            const command = e.command
            const builder = command.builder
            data.push(builder)
            commands[builder.name] = e.executors
        })
        rest.put(Routes.applicationCommands(bot.id), {body: data}).catch(console.error)
    }
}