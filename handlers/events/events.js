module.exports = {
    events: {},
    handler: {
        path: "events/" // Returns a list of all .js scripts required
    },
    async start(bot, files) {
        files.forEach(e => {
            e.load(bot)
            bot[e.type](e.event, (...args) => e.execute(...args, bot))
        })
    }
}