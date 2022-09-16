const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const router = express.Router();
const sanitize = require("mongo-sanitize");

const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = {
    "locations": MongoClient.db(config.databaseName).collection(config.databaseName + "Locations"),
    "comments": MongoClient.db(config.databaseName).collection(config.databaseName + "Comments"),
    "characters": MongoClient.db(config.databaseName).collection(config.databaseName + "Characters"),
    "pages": MongoClient.db(config.databaseName).collection(config.databaseName + "Pages")
};


router.post('/', async function (req, res) {

    //Check if character chosen.
    if (req.session.activeCharacter !== undefined) {
        //Get and sanitize input
        let characterName = req.session.activeCharacter.name;
        let characterSlug = req.session.activeCharacter.slug;
        let commentedType = req.body.page === undefined && req.body.location !== undefined ? 'location' : 'page';
        let commentedSlug = commentedType === 'location' ? sanitize(req.body.location) : sanitize(req.body.page);
        let commentText = sanitize(req.body.comment);
        let DateTime = new Date().toLocaleString();

        // Check is user input exits
        if (commentedSlug !== null && commentText !== null) {

            //Check the database if user can comment there
            let commented = commentedType === 'location' ? await MongoDBCollection.locations.findOne({
                "location_slug": commentedSlug,
                $or: [{"location_restricted_to": "0"}, {"location_restricted_to": characterSlug}]
            }, {
                projection: {
                    "location_slug": 1,
                    "location_name": 1
                }
            }) : await MongoDBCollection.pages.findOne({"page_slug": commentedSlug}, {
                projection: {
                    "page_slug": 1,
                    "page_name": 1
                }
            });

            //if can, insert comment to database
            if (commented !== null && commentText.length !== 0) {

                if (commentedType === 'location') {

                    MongoDBCollection.comments.insertOne({
                        "comment_location_name": commented.location_name,
                        "comment_location": commentedSlug,
                        "comment_character": characterName,
                        "comment_character_slug": characterSlug,
                        "comment_date": DateTime,
                        "comment_text": commentText
                    });


                } else {

                    MongoDBCollection.comments.insertOne({
                        "comment_page_name": commented.page_name,
                        "comment_page": commentedSlug,
                        "comment_character": characterName,
                        "comment_character_slug": characterSlug,
                        "comment_date": DateTime,
                        "comment_text": commentText,
                        "comment_allowed": req.session.userPermissions.includes('moderator') || req.session.userPermissions.includes('administrator')
                    });

                }
                //after insert, redirect
                res.writeHead(302, {
                    'Location': (commentedType === 'location' ? '/locations?id=' : '/pages?id=') + commentedSlug
                });
                res.end();

            } else {

                res.writeHead(302, {
                    'Location': '/asd'
                });
                res.end();
            }
        } else {

            res.writeHead(302, {
                'Location': '/asdasd'
            });
            res.end();


        }
    } else {

        res.writeHead(302, {
            'Location': '/asdasdasd'
        });
        res.end();


    }


});


module.exports = router;