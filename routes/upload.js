var express = require('express');
var router = express.Router();

var processor = require("../processor");

router.post('/tsv', function (req, res) {
    console.log("TSV upload with " + req.body.length + " lines");
    try {
        processor.processScrum(req.body);
        res.sendStatus(200);
    }
    catch (ex) {
        res.status(400).send(ex);
    }
});

module.exports = router;
