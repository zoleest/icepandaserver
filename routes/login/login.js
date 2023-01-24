const express = require('express');
const router = express.Router();


// require language file
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const Mongo = require('mongodb');
const bcrypt = require("bcryptjs");
const sanitize = require("mongo-sanitize");

// function that used to count the date difference to let the user create new characters
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});

router.post('/', async function (req, res) {

    try {
        //check username before process
        let usernameRegex = /^[a-zA-Z0-9]{3,32}$/;
        let username = sanitize(req.body.username.toLowerCase());
        let password = sanitize(req.body.password);
        let error = false;

        if (!usernameRegex.test(username)) throw "loginUsernamePasswordError";

        //connect to mongodb collection

        MongoClient.connect();
        const MongoDBCollection = {
            "users": MongoClient.db(config.databaseName).collection(config.databaseName + "Users"),
            "characters": MongoClient.db(config.databaseName).collection(config.databaseName + "Characters")
        };


        //Checks for the username, and get the password for validation
        let loginData = await MongoDBCollection.users.findOne({
            "username": username,
            registrationHash: {$exists: false}
        }, {projection: {"password": 1, "permissions": 1, "characters": 1, "registrationDate": 1, "level": 1}});

        if (loginData === null) throw "loginUsernamePasswordError";

        let isPasswordCorrect = await bcrypt.compare(password, loginData.password);

        if (!isPasswordCorrect) throw "loginUsernamePasswordError";
        //Creating the session. characters ordered.
        req.session.loggedIn = true;
        req.session.userName = username;
        req.session.userPermissions = loginData.permissions;
        let characters = await MongoDBCollection.characters.find({
            "character_user_username": req.session.userName,
            "character_isactive": 1
        }, {projection: {"character_name": 1, "character_name_slug": 1}}).toArray();
        req.session.userCharacters = characters;
        req.session.level = loginData.level;
        let now = new Date();
        let registerDate = new Date(Date.parse(loginData.registrationDate));
        //+1 so player can start game with new character
        req.session.userMonthSinceRegistration = monthDiff(registerDate, now);

        //set the first character active

        if (characters.length !== 0) {
            req.session.activeCharacter = {
                "slug": characters[0].character_name_slug,
                "name": characters[0].character_name
            };
        }


        res.status(201).json({
            loggedIn: true,
            activeCharacter: req.session.activeCharacter,
            charactersData: req.session.userCharacters
        });


//If there is error display the - this time - only error
    } catch (error) {
        if (error) {
            res.status(201).json({error: error});
        }
    }finally{
        MongoClient.close()
    }


});

module.exports = router;

