const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize');
const config = require('../../config');
const Mongo = require("mongodb");

//connect to mongo and two collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollections = {
    'users': MongoClient.db(config.databaseName).collection(config.databaseName+"Users"),
    'characters': MongoClient.db(config.databaseName).collection(config.databaseName+"Characters")
};


router.get('/', function (req, res) {

    //checks if logged in, if not, transfer to index
    if (req.session.loggedIn !== undefined) {

        //ger character slug from query, and username from session
        let character = sanitize(req.query.char);


        //if character not set, then transfer to index
        if (character !== undefined) {
            let username = req.session.userName;
            //if admin, not lookup on username
            if (req.session.userPermissions.includes('administrator')) {

                //search in database
                MongoDBCollections.characters.findOne({
                    "character_name_slug": character,
                    "character_isactive": 1
                }, {projection: {}}).then(function (result) {

                    //if found, render form, else transfer to index
                    if (result !== null) {

                        res.render('my_characters/deactivate_character_form', {
                            "character": character,
                            "hiddenIfAdmin": 'hidden'
                        });

                    } else {

                        res.writeHead(302, {
                            'Location': '/'
                        });
                        res.end();
                    }
                });


            } else {

                //search in database
                MongoDBCollections.characters.findOne({
                    "character_name_slug": character,
                    "character_user_username": username,
                    "character_isactive": 1
                }, {projection: {}}).then(function (result) {

                    //if found, render form, else transfer to index
                    if (result !== null) {

                        res.render('my_characters/deactivate_character_form', {
                            "character": character,
                            "hiddenIfAdmin": ''
                        });

                    } else {

                        res.writeHead(302, {
                            'Location': '/'
                        });
                        res.end();
                    }

                });
            }
        } else {
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();


        }


    } else {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }

});

router.post('/', async function (req, res) {

    //if logged in continus, else redirecti to index
    if (req.session.loggedIn !== undefined) {


        //get the post values
        let password = sanitize(req.body.password);
        let character = sanitize(req.body.character);

        //search for character's username
        let userNameFromDatabase = await MongoDBCollections.characters.findOne({"character_name_slug": character}, {projection: {"character_user_username": 1}});

        if (userNameFromDatabase !== null) {

            //if admin, delet this, else continue
            if (req.session.userPermissions.includes('administrator')) {

                //set inactive in database
                MongoDBCollections.characters.updateOne({"character_name_slug": character}, {$set: {"character_isactive": 0}});

                const index = req.session.userCharacters.indexOf(character);

                //remove item from session.userCharacters;
                if (index > -1) {
                    req.session.userCharacters.splice(index, 1); // 2nd parameter means remove one item only
                }

                res.render('my_characters/deactivate_character_success');

            } else {

                //if not the logged in user, redirect to index
                if (userNameFromDatabase.character_user_username === req.session.userName) {

                    //get the password from the database
                    let passwordFromDatabase = await MongoDBCollections.users.findOne({"username": result.character_user_username}, {projection: {"password": 1}});

                    //check the password, if okay, delet this
                    bcrypt.compare(password, passwordFromDatabase.password).then(function (matchingPassword) {
                        if (matchingPassword) {

                            //set inactive in database
                            MongoDBCollections.characters.updateOne({"character_name_slug": character}, {$set: {"character_isactive": 0}});
                            res.render('my_characters/deactivate_character_success');

                        } else {


                            res.render('my_characters/deactivate_character_error');

                        }

                    });


                } else {

                    res.writeHead(302, {
                        'Location': '/characters?id=' + slug
                    });
                    res.end();

                }


            }


        } else {

            res.render('my_characters/deactivate_character_error');

        }


    } else {

        res.writeHead(302, {
            'Location': '/characters?id=' + slug
        });
        res.end();


    }

});
module.exports = router;