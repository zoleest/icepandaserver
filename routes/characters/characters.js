const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const router = express.Router();
const sanitize = require("mongo-sanitize");

//connect to mongodb collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});


router.get('/:id', async function (req, res) {

    //slug name from "id" variable
    const slug = sanitize(req.params.id);


    //if slug is defined, look for it in the database
    if (slug !== undefined) {


        try {
            await MongoClient.connect();
            const MongoDBCollections =
                {
                    characters: MongoClient.db(config.databaseName).collection(config.databaseName + "Characters"),
                    properties: MongoClient.db(config.databaseName).collection(config.databaseName + "Properties")
                };

            let characterById = await MongoDBCollections.characters.findOne({"character_name_slug": slug});

            let properties =  await MongoDBCollections.properties.find({"property_id": {"$in": characterById.character_properties}}).toArray();


           //if there are existing document, then render, else render all
            if (characterById !== null) {
                characterById.character_properties = properties;


                res.render("characters/single_character", {
                    "json": characterById,
                    "config": config,
                    "language": language,
                    "isLoggedIn": req.session.loggedIn,
                    "characters": req.session.userCharacters,
                    "activeCharacter": req.session.activeCharacter,
                    "permissions": req.session.userPermissions,
                    "level": req.session.level,
                    "titlePartial": characterById.character_name,
                    "urlPartial": '/character/' + slug

                });
            }
        } catch (error) {
            console.log(error);
        }finally{
            await MongoClient.close();
        }

    }
});

router.get('/', async function (req, res) {

    try {
        MongoClient.connect();
        const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Characters");
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
                "titlePartial": language.characters.locations,
                "urlPartial": '/characters'
            });


    } catch (error) {
        console.log(error);
    } finally {
        await MongoClient.close();
    }

});
module.exports = router;