const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {

    req.session.destroy();

    res.writeHead(302, {
        'Location': '/'
    });
    res.end();


});

router.post('/', function (req, res) {

    req.session.destroy();

    res.writeHead(302, {
        'Location': '/'
    });
    res.end();

});

module.exports = router;

