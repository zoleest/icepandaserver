const express = require('express');
const router = express.Router();
const config = require("../config");
const language = require("../languages/"+config.languageCode);

/* GET home page. */
router.get('/', function(req, res, next) {

  res.locals.query = req.query;
  res.render('index',
      { "config" : config,
        "language": language,
          "isLoggedIn": req.session.loggedIn,
          "characters": req.session.userCharacters,
          "activeCharacter": req.session.activeCharacter,
        "titlePartial" : "Magyarország legkirályabb szerepjátéka!",
        "urlPartial": '',
              });
});

module.exports = router;
