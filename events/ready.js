module.exports = {
    event: 'ready', // Event name
    type: 'on', // Type, 'on' or 'once'
    load: () => {}, // When this file has been loaded
    execute: (bot) => {} // When event has been executed
}