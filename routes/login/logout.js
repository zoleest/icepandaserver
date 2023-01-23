const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {

    req.session.destroy();

    res.status(201).json({success: true});


});

module.exports = router;

