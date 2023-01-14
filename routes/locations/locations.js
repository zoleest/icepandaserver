const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const sanitize = require("mongo-sanitize")


const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
MongoClient.connect();
const MongoDBCollection = {
    "locations": MongoClient.db(config.databaseName).collection(config.databaseName + "Locations"),
    "comments": MongoClient.db(config.databaseName).collection(config.databaseName + "Comments")
};

/* GET users listing. */
router.get('/', async function (req, res, next) {

    //get the type of the locations to list
    let tag = sanitize(req.query.tag);
    //get your slug to search for restricted locations
    let restrictedTo = req.session.activeCharacter !== undefined ? req.session.activeCharacter.slug : "";

    //get comment page number
    let commentPage = (req.query.pg !== undefined && !isNaN(req.pg)) ? sanitize(req.query.pg) : 1;


    if (req.query.id !== undefined) {
        //get and sanitize the slug from query
        let locationSlug = sanitize(req.query.id);

        //Get the desired location's data
        let locationJson = await MongoDBCollection.locations.findOne({"location_slug": locationSlug});

        //if location exist check for comments
        if (locationJson !== null) {


            //get comments from database
            let commentsJson = await MongoDBCollection.comments.find({"comment_location": locationSlug}).sort({"comment_date": -1}).skip((commentPage - 1) * config.commentPageLimit).limit(config.commentPageLimit).toArray();


            if (commentsJson.length === 0) {

                commentsJson = await MongoDBCollection.comments.find({"comment_location": locationSlug}).sort({"comment_date": -1}).limit(config.commentPageLimit).toArray();


            }

            //If it's not a restricted area (or if moderator or higher) then continue to searching for the comments
            if (locationJson.location_restricted_to === "0" || locationJson.location_restricted_to.includes(req.session.activeCharacter.slug) || req.session.userPermissions.includes("moderator") || req.session.userPermissions.includes("administrator")) {


                res.render('locations/single_location',
                    {
                        "locationData": locationJson,
                        "comments": commentsJson,
                        "selectedCharacter": req.session.activeCharacter,
                        "config": config,
                        "language": language,
                        "isLoggedIn": req.session.loggedIn,
                        "characters": req.session.userCharacters,
                        "activeCharacter": req.session.activeCharacter,
                        "titlePartial": locationJson.location_name,
                        "permissions": req.session.userPermissions,
                        "level": req.session.level,
                        "urlPartial": '/location?id=' + req.query.id,
                        "CKEPosition": 'comment'
                    });
            } else {

                //if not, check if have watcher permission, if not then redirect if it is, then it's without comment form
                if (req.session.userPermissions.includes('watcher')) {

                    res.render('locations/single_location',
                        {
                            "locationData": locationJson,
                            "comments": commentsJson,
                            "selectedCharacter": req.session.activeCharacter,
                            "config": config,
                            "language": language,
                            "isLoggedIn": req.session.loggedIn,
                            "characters": req.session.userCharacters,
                            "activeCharacter": req.session.activeCharacter,
                            "titlePartial": locationJson.location_name,
                            "permissions": req.session.userPermissions,
                            "level": req.session.level,
                            "urlPartial": '/location?id=' + req.query.id,
                            "CKEPosition": 'none'
                        });

                } else {
                    res.json({"asd": "Ne leskelődj tesó!"});
                }
            }

        } else {

            //get the first page of locations


            //if tag's value is not assigned, then tag value become public
            if (tag === undefined) {
                tag = "public";
            }

            //if tag is not private, ignore the restrictedTo value with setting it to zero
            if (tag !== "private") {

                restrictedTo = "0";

            }

            let locationsMenuJson = await MongoDBCollection.locations.find({
                "location_restricted_to": restrictedTo,
                "location_type": tag
            }, {
                projection: {
                    'location_name': 1,
                    'location_slug': 1
                }
            }).sort({"location_name": 1}).limit(config.locationsPageLimit).toArray();

            res.render('locations/locations',
                {
                    "locationData": locationsMenuJson,
                    "config": config,
                    "language": language,
                    "isLoggedIn": req.session.loggedIn,
                    "characters": req.session.userCharacters,
                    "activeCharacter": req.session.activeCharacter,
                    "permissions": req.session.userPermissions,
                    "level": req.session.level,
                    "titlePartial": language.locations.locations,
                    "urlPartial": '/location'
                });
        }


    } else {

        //if tag's value is not assigned, then tag value become public
        if (tag === undefined) {
            tag = "public";
        }

        //if tag is not private, ignore the restrictedTo value with setting it to zero
        if (tag !== "private") {

            restrictedTo = "0";

        }

        // get the n-th page of locations
        let locationsMenuJson = await MongoDBCollection.locations.find({
            "location_restricted_to": restrictedTo,
            "location_type": tag
        }).sort({"location_name": 1}).skip((commentPage - 1) * config.locationsPageLimit).limit(config.locationsPageLimit).toArray();

        if (locationsMenuJson.length === 0) {

            locationsMenuJson = await MongoDBCollection.locations.find({
                "location_restricted_to": restrictedTo,
                "location_type": tag
            }).limit(config.locationsPageLimit).toArray();

        }

        res.render('locations/locations',
            {
                "locationData": locationsMenuJson,
                "config": config,
                "language": language,
                "isLoggedIn": req.session.loggedIn,
                "characters": req.session.userCharacters,
                "activeCharacter": req.session.activeCharacter,
                "permissions": req.session.userPermissions,
                "level": req.session.level,
                "titlePartial": language.locations.locations,
                "urlPartial": '/location'
            });


    }


});

module.exports = router;