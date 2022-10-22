// Import
const {Client, GatewayIntentBits} = require('discord.js')
const {readdirSync} = require('fs')

// Create Client
const Bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
})

// Settings
const Token = ''
const Id = ''

// For us to look submit commands to the but using REST
Bot["token"] = Token
Bot["id"] = Id

// Operators
const Handler = {
    file: "handlers/",
    loaded: [],
    load: (path) => {
        const f = require('./'+path)
        const events = f.events
        const start = f.start
        const handlers = f.handler
        const p = handlers.path

        for (const [k,v] of Object.entries(events)) Bot.on(k , (...args) => v(...args, Bot))

        const paths = []
        Handler.look(p, Handler.look, (pp) => paths.push(require('./'+pp)))
        start(Bot, paths)
    },
    look: (path, look, load) => {
        readdirSync(path).forEach(f => {
            if (!f.endsWith(".js")) {
                look(path+f+'/', look, load)
            } else {
                load(path+f)
            }
        })
    }
}

Handler.look(Handler.file, Handler.look, Handler.load)

Bot.login(Token)
