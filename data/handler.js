const sqlite = require('better-sqlite3')

var db 
module.exports = {
    get() {return db},
    start() {db = new sqlite('./data.sqlite')}
}