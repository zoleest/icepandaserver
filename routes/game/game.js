const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const sanitize = require("mongo-sanitize")

const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});


/* GET single game. */
router.get('/:tag/:id', async function (req, res, next) {

    /*Empty session variables declare if not exist*/
    req.session.activeCharacter = req.session.activeCharacter!==undefined?req.session.activeCharacter:{
        "slug": "",
        "name":""
    };
    req.session.userPermissions = req.session.userPermissions!==undefined?req.session.userPermissions:"";

    //Get the pagetype
    let pagetype = req.params.pagetype;

    //get the tag
    let tag = req.params.tag;

    // get comment page number
    let commentPage = (req.query.pg !== undefined && !isNaN(req.pg)) ? sanitize(req.query.pg) : 1;

    let restrictedTo = req.session.activeCharacter.slug;

    let commentJson = [];

    if (req.params.id !== undefined) {
        //get and sanitize the slug from query

        let locationSlug = sanitize(req.params.id);

        if (pagetype === "locations") {



            try {


                await MongoClient.connect();
                const MongoDBCollection = {
                    "locations": MongoClient.db(config.databaseName).collection(config.databaseName + "Locations"),
                    "comments": MongoClient.db(config.databaseName).collection(config.databaseName + "Comments")
                };


                //Get the desired location's data
                const locationJson = await MongoDBCollection.locations.findOne({"location_slug": locationSlug});


                //if location exist check for comments
                if (locationJson !== null) {



                    //get comments from database
                    let commentsJson = await MongoDBCollection.comments.find({"comment_location": locationSlug}).sort({"comment_date": -1}).skip((commentPage - 1) * config.commentPageLimit).limit(config.commentPageLimit).toArray();


                    if (commentsJson.length === 0) {


                        commentsJson = await MongoDBCollection.comments.find({"comment_location": locationSlug}).sort({"comment_date": -1}).limit(config.commentPageLimit).toArray();



                    }


                   //If it's not a restricted area (or if moderator or higher) then continue to searching for the comments
                    if (locationJson.location_restricted_to === "0" || locationJson.location_restricted_to.includes(req.session.activeCharacter.slug) || req.session.userPermissions.includes("moderator") || req.session.userPermissions.includes("administrator")) {


                        res.render('game/single_location',
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
                                "urlPartial": 'game/locations/'+ tag + "/" + req.params.id,
                                "CKEPosition": 'comment'
                            });

                    } else {
                        console.log('asd');
                        //if not, check if have watcher permission, if not then redirect if it is, then it's without comment form
                        if (req.session.userPermissions.includes('watcher')) {

                            res.render('game/single_location',
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
                                    "urlPartial": 'game/locations/'+ tag + "/" + req.params.id,
                                    "CKEPosition": 'none'
                                });

                        } else {
                            res.writeHead(302, {
                                'Location': '/game/locations/public'
                            });
                            res.end();
                        }
                    }

                } else {

                    //get the first page of game


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

                    res.render('game/locations',
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
                            "urlPartial": '/game/locations/public'
                        });
                }


            } catch (error) {

            } finally {
                await MongoClient.close();
            }

        } else if (pagetype === 'pages') {

            console.log(pagetype + "0" + locationSlug)
            try {
                await MongoClient.connect();
                const MongoDBCollection = {
                    "pages": MongoClient.db(config.databaseName).collection(config.databaseName + "Pages"),
                    "comments": MongoClient.db(config.databaseName).collection(config.databaseName + "Comments")
                };

                //Get the desired location's data
                let pageJson = await MongoDBCollection.pages.findOne({"page_slug": locationSlug});

                //if page exist check if commentable
                if (pageJson !== null) {

                    if (pageJson.page_commentable === true) {

                        //get comment page number
                        let commentPage = (req.query.pg !== undefined && !isNaN(req.pg)) ? sanitize(req.query.pg) : 1;

                        //get comments from database
                        commentsJson = await MongoDBCollection.comments.find({
                            "comment_page": locationSlug,
                            "comment_allowed": true
                        }).sort({"comment_date": -1}).skip((commentPage - 1) * config.commentPageLimit).limit(config.commentPageLimit).toArray();


                        if (commentsJson.length === 0) {

                            commentsJson = await MongoDBCollection.comments.find({
                                "comment_page": locationSlug,
                                "comment_allowed": true
                            }).sort({"comment_date": -1}).limit(config.commentPageLimit).toArray();


                        }

                    }

                    res.render('game/single_page', {
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
                        "urlPartial": '/game/pages/' + tag + '/' + req.params.id,
                        "CKEPosition": 'comment'
                    });

                } else {

                    res.writeHead(302, {
                        'Location': '/'
                    });
                    res.end();
                }

            } catch (error) {
                console.log(error);
            } finally {
                await MongoClient.close();
            }

        } else {
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }
    } else {

        res.writeHead(302, {
            'Location': pagetype === 'locations' ? '/game/locations' : '/'
        });
        res.end();


    }


});


/* Get location list*/
router.get('/:tag/list/:id/', async function (req, res, next) {


    //get the type of the game to list
    let tag = sanitize(req.params.tag);

    let restrictedTo = req.session.activeCharacter !== undefined ? req.session.activeCharacter.slug : "";

    //get page number
    let pageNumber = (req.params!== undefined && !isNaN(req.params.pg)) ? sanitize(req.params.pg) : 1;



   //if tag's value is not assigned, then tag value become public
        if (tag === undefined) {
            tag = "public";
        }

        //if tag is not private, ignore the restrictedTo value with setting it to zero
        if (tag !== "private") {

            restrictedTo = "0";

        }



            try {

                await MongoClient.connect();
                const MongoDBCollection = {
                    "locations": MongoClient.db(config.databaseName).collection(config.databaseName + "Locations")
                };

                // get the n-th page of game
                let locationsMenuJson = await MongoDBCollection.locations.find({
                    "location_restricted_to": restrictedTo,
                    "location_type": tag
                }).sort({"location_name": 1}).skip((pageNumber - 1) * config.locationsPageLimit).limit(config.locationsPageLimit).toArray();

                if (locationsMenuJson.length === 0) {

                    locationsMenuJson = await MongoDBCollection.locations.find({
                        "location_restricted_to": restrictedTo,
                        "location_type": tag
                    }).limit(config.locationsPageLimit).toArray();

                }

                res.status(201).json(locationsMenuJson);



            } catch (error) {
                console.log(error);
                res.status(400).json({error:error})
            } finally {
                await MongoClient.close();

            }


});


module.exports = router;