const express = require('express');
const sanitize = require("mongo-sanitize");
const router = express.Router();
const Mongo = require('mongodb');
const config = require("../../config");

const language = require("../../languages/" + config.languageCode);
const fs = require('fs');
const sharp = require('sharp');

//connect to mongodb collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
MongoClient.connect();
const MongoDBCollections = {
    'users': MongoClient.db(config.databaseName).collection(config.databaseName + "Users"),
    'characters': MongoClient.db(config.databaseName).collection(config.databaseName + "Characters")
};


router.get('/', async function (req, res) {

    if (req.session.loggedIn !== undefined) {

        //if allowed is more than used, or user is admin, then render the form

        if ((req.session.level > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator')) {
            res.render("my_characters/new_character_form", {
                "config": config,
                "language": language,
                "titlePartial": language.characters.newCharacter,
                "permissions": req.session.userPermissions,
                "level": req.session.level,
                "urlPartial": '/my-character/new',
                "CKEPosition": 'comment'
            });
        } else {
            res.render("my_characters/new_character_exceeded_limit");
        }


    } else {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }

});

router.post('/', async function (req, res) {


    //if logged in, continue, else redirect to index
    if (req.session.loggedIn !== undefined) {

        //if allowed is more than used, or user is admin, then render the form
        if ((req.session.level + req.session.userMonthSinceRegistration > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator')) {

            // Get variables from POST data
            let name = sanitize(req.body.name);
            let nickname = sanitize(req.body.nickname);
            let birthday = sanitize(req.body.birthday);
            let species = sanitize(req.body.species);
            let sexuality = sanitize(req.body.sexuality);
            let sex = sanitize(req.body.sex);
            let weapons = [];
            let abilities = [];
            let story = sanitize(req.body.story);
            let interests = sanitize(req.body.interests);
            let game_style = sanitize(req.body.game_style);
            let profile_picture = sanitize(req.body.profile_picture);
            let slug = name.replace(' ', '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let xp = config.defaultCharacterXP;


            req.body.weapon_name.forEach(function (value, index) {
                if (req.body.weapon_name[index] !== undefined && req.body.weapon_name[index] !== '' && req.body.weapon_description[index] !== undefined && req.body.weapon_description[index] !== '') {
                    weapons.push({
                        "weapon_name": sanitize(req.body.weapon_name[index]),
                        "weapon_description": sanitize(req.body.weapon_description[index])
                    });
                }
            });

            req.body.ability_name.forEach(function (value, index) {
                if (req.body.ability_name[index] !== undefined && req.body.ability_name[index] !== '' && req.body.ability_description[index] !== undefined && req.body.ability_description[index] !== '') {
                    abilities.push({
                        "ability_name": sanitize(req.body.ability_name[index]),
                        "ability_description": sanitize(req.body.ability_description[index])
                    })
                }
            });


            //Check for existing user
            let existingCharacterByName = await MongoDBCollections.characters.findOne({"character_name": name}, {projection: {"character_id": 1}});

            if (existingCharacterByName === null) {

                //Query for the highest character ID

                let maxIdFromDatabase = await MongoDBCollections.characters.find({}, {projection: {"character_id": 1}}).sort({"character_id": -1}).limit(1).toArray();
                //naming the received file for profile and avatar
                console.log(maxIdFromDatabase);
                let filename = name.toLowerCase().replace(" ", "_") + ".webp";
                //getting the image data by splitting
                let parts = profile_picture.split(';');
                let mimType = parts[0].split(':')[1];
                let imageData = parts[1].split(',')[1];


                //Resize to configured profile size
                var img = new Buffer(imageData, 'base64');
                sharp(img)
                    .webp({lossless: true})
                    .resize(config.profilePictureSize, config.profilePictureSize)
                    .toBuffer()
                    .then(resizedImageBuffer => {
                        let resizedImageData = resizedImageBuffer.toString('base64');


                        let resizedBase64 = `${resizedImageData}`;
                        let path = __dirname + "../../../public/images/profile_pictures/" + filename;

                        //write the profile picture
                        fs.writeFile(path, resizedBase64, 'base64', function () {

                        });

                    })
                    .catch(error => {
                        res.send(error)
                    });


                //Resize to configured avatar size
                sharp(img)
                    .resize(config.avatarPictureSize, config.avatarPictureSize)
                    .webp({lossless: true})
                    .toBuffer()
                    .then(resizedImageBuffer => {
                        let resizedImageData = resizedImageBuffer.toString('base64');


                        let resizedBase64 = `${resizedImageData}`;
                        let path = __dirname + "../../../public/images/avatars/" + filename;

                        //write the profile picture
                        fs.writeFile(path, resizedBase64, 'base64', function () {


                        });

                    })
                    .catch(error => {
                        // error handeling
                        res.send(error)
                    });


                //insert to database
                let inserted = await MongoDBCollections.characters.insertOne({
                    "character_id": maxIdFromDatabase[0].character_id + 1,
                    "character_name": name,
                    "character_nicknames": nickname,
                    "character_birthday_date": birthday,
                    "character_species": species,
                    "character_sexuality": sexuality,
                    "character_sex": sex,
                    "character_weapons": weapons,
                    "character_abilities": abilities,
                    "character_relationships": [],
                    "character_properties": [],
                    "character_story": story,
                    "character_interests": interests,
                    "character_game_style": game_style,
                    "character_name_slug": slug,
                    "character_xp": xp,
                    "character_isactive": 1,
                    "character_user_username": req.session.userName


                });

                if (inserted !== null) {

                    MongoDBCollections.users.updateOne({"username": req.session.userName}, {$push: {"characters": slug}});

                    req.session.userCharacters.push({"character_name": name, "character_name_slug": slug});
                    req.session.activeCharacter = {"name": name, "slug": slug};


                }


                res.writeHead(302, {
                    'Location': '/characters?id=' + slug
                });
                res.end();
            } else {

                res.send('asdasdsa');

            }


        }


    }
});
module.exports = router;