const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017/nsspl";
const client = new MongoClient(uri);
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