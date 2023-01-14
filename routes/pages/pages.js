const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const sanitize = require("mongo-sanitize")


const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
MongoClient.connect();
const MongoDBCollection = {
    "pages": MongoClient.db(config.databaseName).collection(config.databaseName + "Pages"),
    "comments": MongoClient.db(config.databaseName).collection(config.databaseName + "Comments")
};

/* GET users listing. */
router.get('/:id', async function (req, res, next) {


    //The Json array that contains comments
    let commentsJson = [];

    if (req.params.id) {
        //get and sanitize the slug from query
        let pageSlug = sanitize(req.params.id);

        //Get the desired location's data
        let pageJson = await MongoDBCollection.pages.findOne({"page_slug": pageSlug});

        //if page exist check if commentable
        if (pageJson !== null) {

            if (pageJson.page_commentable === true) {

                //get comment page number
                let commentPage = (req.query.pg !== undefined && !isNaN(req.pg)) ? sanitize(req.query.pg) : 1;

                //get comments from database
                commentsJson = await MongoDBCollection.comments.find({
                    "comment_page": pageSlug,
                    "comment_allowed": true
                }).sort({"comment_date": -1}).skip((commentPage - 1) * config.commentPageLimit).limit(config.commentPageLimit).toArray();


                if (commentsJson.length === 0) {

                    commentsJson = await MongoDBCollection.comments.find({
                        "comment_page": pageSlug,
                        "comment_allowed": true
                    }).sort({"comment_date": -1}).limit(config.commentPageLimit).toArray();


                }

            }

            res.render('pages/pages', {
                "pageData": pageJson,
                "comments": commentsJson.length !== 0 ? commentsJson : null,
                "selectedCharacter": req.session.activeCharacter,
                "config": config,
                "language": language,
                "isLoggedIn": req.session.loggedIn,
                "characters": req.session.userCharacters,
                "activeCharacter": req.session.activeCharacter,
                "permissions": req.session.userPermissions,
                "level": req.session.level,
                "titlePartial": pageJson.page_name,
                "urlPartial": '/page?id=' + req.query.id,
                "CKEPosition": 'comment'
            });

        } else {

            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }


    }


});

module.exports = router;