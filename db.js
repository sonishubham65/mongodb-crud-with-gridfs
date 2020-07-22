const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(process.env.DBURI);
var DB;
client.connect((err, db) => {
    //console.log(db)
    if (err) {
        console.log(err)
    } else {
        DB = db.db();
    }
});

module.exports = {
    db: function () {
        return DB;
    }
}