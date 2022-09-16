const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const router = express.Router();
const sanitize = require("mongo-sanitize");

//connect to mongodb collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Characters");


async function getAllCharacters(res) {

    let characters = await MongoDBCollection.find({}, {projection: {"character_name": 1}}).toArray();

    if (characters !== null) {
        let result = [];
        characters.forEach(function (value) {
            result.push(value);
        });

        res.render("characters/characters", {"json": result});
    }


}


router.get('/', async function (req, res) {

    //slug name from "id" variable
    const slug = sanitize(req.query.id);


    //if slug is defined, look for it in the database
    if (slug !== undefined) {

        let characterById = await MongoDBCollection.findOne({"character_name_slug": slug});
        //if there are existing document, then render, else render all
        if (characterById !== null) {
            res.render("characters/single_character", {"json": [characterById]});
        }
    } else {

        let charactersMenuJson = await MongoDBCollection.find({}, {
            projection: {
                'character_name_slug': 1,
                'character_name': 1
            }
        }).sort({"character_name": 1}).limit(config.locationsPageLimit).toArray();

        //if id not set, render all
        res.render('characters/characters',
            {
                "charactersData": charactersMenuJson,
                "config": config,
                "language": language,
                "isLoggedIn": req.session.loggedIn,
                "characters": req.session.userCharacters,
                "activeCharacter": req.session.activeCharacter,
                "permissions": req.session.userPermissions,
                "level": req.session.level,
                "titlePartial": language.locations.locations,
                "urlPartial": '/characters'
            });

    }


});

module.exports = router;