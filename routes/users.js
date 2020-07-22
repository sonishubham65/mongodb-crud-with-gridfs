var express = require('express');
var router = express.Router();
var DB = require('../db');

const { ObjectId } = require('mongodb');
const mongo = require('mongodb');

var fs = require('fs');
const formidable = require('formidable');
const { use } = require('.');

/**
 * @description: insert user
 * @param: name, phone, age
 */
router.post('/', function (req, res, next) {
  try {
    var myobj = req.body;
    DB.db().collection("students").insertOne(myobj, function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.insertedCount);
      res.status(201).json({ success: 1, message: "You have successfully inserted record." })
    });
  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }
});

/**
 * @description: find one user
 * @param: id
 */
router.get('/:ID', async function (req, res, next) {
  try {
    var userId = req.params.ID;
    var result = await DB.db().collection("students").findOne({ _id: ObjectId(userId) });
    res.status(200).json({ success: 1, data: result })
  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }

});

/**
 * @description: find all users
 */
router.get('/', async function (req, res, next) {
  try {
    var users = await DB.db().collection("students").find({}).toArray();
    users.forEach(user => {
      if (user.profile) {
        user.profile = `${process.env.APIHOST}users/picture/${user.profile}`;
      }
    })
    res.status(200).json({ success: 1, data: users })
  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }
});

/**
 * @description: delete user
 * @param: id
 */
router.delete('/:ID', async function (req, res, next) {
  try {
    var userId = req.params.ID;
    var result = await DB.db().collection("students").deleteOne({ _id: ObjectId(userId) });
    if (result.deletedCount)
      res.status(200).json({ success: 1 })
    else
      res.status(204).json() // No content
  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }
});

/**
 * @description: update user info
 * @param: name,phone,age
 */
router.patch('/:ID', async function (req, res, next) {
  try {
    var userId = req.params.ID;
    let update = req.body;
    var result = await DB.db().collection("students").updateOne({ _id: ObjectId(userId) }, { $set: update }, {
      upsert: false
    });
    console.log(result.matchedCount)
    if (result.modifiedCount)
      res.status(202).json({ success: 1 })
    else if (result.matchedCount)
      res.status(200).json({ success: 1 })
    else
      res.status(204).json()
  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }
});

/**
 * @description: update profile image
 * @param: picture: file
 */
router.post('/picture/:ID', async function (req, res, next) {
  try {
    var userId = req.params.ID;
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      let file = files.profile;

      var bucket = new mongo.GridFSBucket(DB.db());
      let writeStream = bucket.openUploadStream({
        filename: file.name
      });

      fs.createReadStream(file.path).
        pipe(writeStream).
        on('error', function (error) {
          res.status(500).json({ success: 0, message: e.message })
        }).
        on('finish', async function () {
          var result = await DB.db().collection("students").updateOne({ _id: ObjectId(userId) }, { $set: { profile: writeStream.id } });
          console.log(result.modifiedCount, result.matchedCount)
          if (result.modifiedCount)
            res.status(202).json({ success: 1 })
          else if (result.matchedCount)
            res.status(200).json({ success: 1 })
          else
            res.status(204).json()
        });
    });


  } catch (e) {
    res.status(500).json({ success: 0, message: e.message })
  }
});

/**
 * @description: Get profile image
 * @param: fileId
 */
router.get('/picture/:ID', function (req, res, next) {
  var fileId = req.params.ID;
  const bucket = new mongo.GridFSBucket(DB.db(), {
    chunkSizeBytes: 9192
  });
  bucket.openDownloadStream(ObjectId(fileId)).
    pipe(res)
})



module.exports = router;
