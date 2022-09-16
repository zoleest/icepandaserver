const express = require('express');
const router = express.Router();

// require language file
const language = require("../../language");
const Mongo = require("mongodb");
const config = require("../../config");
const sanitize = require("mongo-sanitize");

router.get('/', async function (req, res, next) {

    //get the activation key from the query
    let activationKey = sanitize(req.query.key);

    //Make connection to MongodDB

    const url = "mongodb://localhost:27017/";

    //Connect the client to Collection
    const MongoClient = new Mongo.MongoClient(url);
    MongoClient.connect();
    const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName+"Users");

    //Check the database if activation key is exist
    let isActivationKeyExist = await MongoDBCollection.findOne({"registrationHash": activationKey}, {userName: 1});
    if (isActivationKeyExist !== null) {

        MongoDBCollection.updateOne({"registrationHash": activationKey}, {$unset: {registrationHash: 1}});
        res.render('registration/activation_success');


    } else {

        res.render('registration/activation_error');

    }

});


module.exports = router;