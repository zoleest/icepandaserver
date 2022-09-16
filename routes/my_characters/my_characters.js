const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const router = express.Router();
const sanitize = require("mongo-sanitize");

const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName+"Characters");


router.get('/', async function (req, res) {

    //checks if user is logged in, or transfer to index page
    if (req.session.loggedIn !== undefined) {

        //searching for characters of the user, and get the characters name.

        let characters = await MongoDBCollection.find({
            "character_user_username": req.session.userName,
            "character_isactive": 1
        }, {projection: {"character_name": 1, "character_name_slug": 1}}).toArray();

        if (characters.length !== 0) {
            //sorting the documents, and sending json

            let jsonArray = [];
            characters.sort().forEach(function (value, key) {
                let characterJson = {"slug": value.character_name_slug, "name": value.character_name};
                jsonArray.push(characterJson);

                if (key + 1 === characters.length) {
                    if (req.session.activeCharacter !== undefined) {
                        res.json({"charactersJson": jsonArray, "activeCharacter": req.session.activeCharacter.slug});


                    } else {
                        res.json({"charactersJson": jsonArray, "activeCharacter": ''});

                    }
                }
            });


        } else {
            res.render("my_characters/new_character_form");
        }


    } else {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }


});

router.post('/', async function (req, res) {

    //checks if user is logged in, or transfer to index page
    if (req.session.loggedIn !== undefined) {

        //check is slug is in the post, else redirect to my characters get page
        if (req.body.character !== undefined) {


            const slug = sanitize(req.body.character);

            console.log(slug);


            //checks if character is in the session
            let isPlayersCharacter = false;
            let switchedCharacterName = null;
            for (let sessionCharactersCounter = 0; sessionCharactersCounter < req.session.userCharacters.length; sessionCharactersCounter++) {

                if (req.session.userCharacters[sessionCharactersCounter].character_name_slug === slug) {
                    isPlayersCharacter = true;
                    switchedCharacterName = req.session.userCharacters[sessionCharactersCounter].character_name;
                    break;
                }

            }

            if (isPlayersCharacter) {
                //setting session variables


                req.session.activeCharacter = {"slug": slug, "name": switchedCharacterName};

                setTimeout(function () {

                    res.writeHead(302, {
                        'Location': '/my-characters'
                    });
                    res.end();
                }, 1000);

            } else {

                res.render("my_characters/character_choice_error");

            }


        } else {

            res.writeHead(302, {
                'Location': '/my_characters'
            });
            res.end();

        }


    } else {

        res.writeHead(302, {
            'Location': '/my-characters'
        });
        res.end();

    }


});

module.exports = router;