var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/insert', function (req, res, next) {
  res.json({ success: 1 })
});

module.exports = router;
