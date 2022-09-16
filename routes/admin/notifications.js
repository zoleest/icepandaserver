const express = require('express');
const router = express.Router();
const config = require("../../config");
const language = require("../../languages/" + config.languageCode)
const Mongo = require("mongodb");


const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = {'comments': MongoClient.db(config.databaseName).collection(config.databaseName + "Comments")};

/* GET home page. */
router.get('/', async function (req, res, next) {

    let notificationJson = [];
    let notification = null;

    //If logged in and admin continue else redirect
    if (req.session.loggedIn === true && (req.session.userPermissions.includes('moderator') || req.session.userPermissions.includes('administrator'))) {

        //First get the comments waiting for moderation

        notification = await MongoDBCollection.comments.countDocuments({'comment_allowed': false});


        //if not null, then add to json
        if (notification !== null) {

            notificationJson.push({'name': language.navbar.pageCommentModeration, 'count': notification});

        }

        //pass Json

        res.json(notificationJson);

    } else {
        res.json({});
    }
});

module.exports = router;
