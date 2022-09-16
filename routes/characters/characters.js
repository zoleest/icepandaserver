const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
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
        } else {
            getAllCharacters(res);
        }
    } else {
        //if id not set, render all
        getAllCharacters(res);

    }

});

module.exports = router;