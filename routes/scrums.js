var express = require('express');
var router = express.Router();

var db = require("../db");

router.get('/:start/:end', function (req, res) {
    db.scrumsBetween(req.params.start, req.params.end).then(function (scrums) {
        res.send(scrums);
    });
});

module.exports = router;
