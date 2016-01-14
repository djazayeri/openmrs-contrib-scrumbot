var express = require('express');
var router = express.Router();

var db = require("../db");

router.get('/:startTime', function (req, res) {
    db.scrum(req.params.startTime).then(function (scrum) {
        res.send(scrum);
    });
});

module.exports = router;
