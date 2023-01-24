const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const language = require("../../languages/" + config.languageCode);
const router = express.Router();
const sanitize = require("mongo-sanitize");
const sharp = require("sharp");
const fs = require("fs");

//connect to mongodb collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});


router.get('/:id/profile', async function (req, res) {

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

            if (characterById === null) throw "character_not_exist"

            let properties = await MongoDBCollections.properties.find({"property_id": {"$in": characterById.character_properties}}).toArray();


            //if there are existing document, then render, else render all
            if (characterById !== null) {
                characterById.character_properties = properties;

                res.status(201).json({character: characterById});
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({error: error});

        } finally {
            await MongoClient.close();
        }

    }
});

router.get('/list', async function (req, res) {

    try {
        MongoClient.connect();
        const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Characters");
        let charactersMenuJson = await MongoDBCollection.find({}, {
            projection: {
                'character_name_slug': 1,
                'character_name': 1
            }
        }).sort({"character_name": 1}).limit(config.locationsPageLimit).toArray();

      res.status(201).json(charactersMenuJson);

    } catch (error) {
        console.log(error);
        res.status(400).json({error: error});
    } finally {
        await MongoClient.close();
    }

});

router.get('/mine/list', async function (req, res) {



    //checks if user is logged in, or transfer to index page


    try {

        if (req.session.loggedIn === undefined) throw "listing_error"

            MongoClient.connect();
            const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Characters");


            let characters = await MongoDBCollection.find({
                "character_user_username": req.session.userName,
                "character_isactive": 1
            }, {projection: {"character_name": 1, "character_name_slug": 1}}).toArray();

            if (characters.length === 0)   throw "go_to_new_character_error"
                //sorting the documents, and sending json

                let jsonArray = [];
                characters.sort().forEach(function (value, key) {
                    let characterJson = {
                        "character_name_slug": value.character_name_slug,
                        "character_name": value.character_name
                    };
                    jsonArray.push(characterJson);

                    if (key + 1 === characters.length) {

                        res.json({list: req.session.userCharacters, activeCharacter: req.session.activeCharacter});


                    }
                });

        } catch (error) {

            console.log(error);

            res.status(400).json({error: error});

        } finally {

            MongoClient.close();
        }


});


router.post('/mine', async function (req, res) {

    try {
        //checks if user is logged in, or transfer to index page
        if (req.session.loggedIn === undefined) throw "User not logged in";

        //check is slug is in the post, else redirect to my characters get page
        if (req.body.character === undefined) throw "No character posted";

        const slug = sanitize(req.body.character);

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


        if (!isPlayersCharacter) throw "Character is not property of user";
        //setting session variables


        req.session.activeCharacter = {"slug": slug, "name": switchedCharacterName};

        setTimeout(function () {

            res.status(201).json({success: true});
        }, 1000);

    } catch (error) {

        console.log(error);

        res.status(201).json({error: 'error_on_query'})

    }

});

router.get('/new', async function (req, res) {

    try {
        if (req.session.loggedIn === undefined) throw "User not logged in"

        //if allowed is more than used, or user is admin, then render the form

        if (!((req.session.level > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator'))) throw "User has no permission to the new character form"

        res.render("characters/edit_character_form", {
            "config": config,
            "language": language,
            "titlePartial": language.characters.newCharacter,
            "permissions": req.session.userPermissions,
            "level": req.session.level,
            "urlPartial": '/characters/new',
            "CKEPosition": 'comment',
            "errorText": undefined,
            "oldProfile": undefined
        });

    } catch (error) {
        console.log(error);

        res.writeHead(302, {
            'Location': '/'
        });
        res.end();

    }


});

router.get('/:id/edit', async function (req, res) {

    try {
        if (req.session.loggedIn === undefined) throw "User not logged in";

        //get id from query's slug
        let slug = req.params.id !== undefined ? sanitize(req.params.id) : "";
        //if session contains slug or admin, then render, else redirect to index

        if (!((req.session.userCharacters.includes(slug) && slug === req.session.actualCharacter) || req.session.userPermissions.includes('administrator'))) throw "User not have the permission to edit"


        await MongoClient.connect();
        const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Characters");

        let character = await MongoDBCollection.findOne({'character_name_slug':slug});

        res.render("characters/edit_character_form", {
            "config": config,
            "language": language,
            "titlePartial": language.characters.newCharacter,
            "permissions": req.session.userPermissions,
            "level": req.session.level,
            "urlPartial": '/characters/new',
            "CKEPosition": 'comment',
            "errorText": undefined,
            "oldProfile": character
        });

    } catch (error) {
        console.log(error);

        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    } finally {
        await MongoClient.close();
    }


});

router.post(['/new', '/:id/edit'], async function (req, res) {

    let sexualityArray = ['Heteroszexuális', "Homoszexuális", "Biszexuális", "Aszexuális", "Egyéb"];

    await MongoClient.connect();
    const MongoDBCollections = {
        'users': MongoClient.db(config.databaseName).collection(config.databaseName + "Users"),
        'characters': MongoClient.db(config.databaseName).collection(config.databaseName + "Characters")
    };

    try {
        //if logged in, continue, else redirect to index
        if (req.session.loggedIn === undefined) throw "User not logged in"

        //if allowed is more than used, or user is admin, then render the form
        if (!((req.session.level + req.session.userMonthSinceRegistration > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator'))) throw "User has no permission to submit new character"

        // Get variables from POST data
        let name = sanitize(req.body.name);
        let nickname = sanitize(req.body.nickname);

        if (!(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test((req.body.birthday)))) throw language.characters.birthday_error;
        let birthday = sanitize(req.body.birthday);

        let species = sanitize(req.body.species);

        if (!sexualityArray.includes(sanitize(req.body.sexuality))) throw language.characters.sexuality_error;
        let sexuality = sanitize(req.body.sexuality);

        if (!((req.body.sex === 'Férfi' || req.body.sex === 'Nő'))) throw language.characters.sex_error;
        let sex = sanitize(req.body.sex);

        let weapons = [];
        let abilities = [];

        let story = sanitize(req.body.story);
        let interests = sanitize(req.body.interests);

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

        if (existingCharacterByName !== null && req.params.id === undefined) throw language.characters.existingCharacter_error;

        //Query for the highest character ID

        let maxIdFromDatabase;
        if (req.params.id === undefined) {
            maxIdFromDatabase = await MongoDBCollections.characters.find({}, {projection: {"character_id": 1}}).sort({"character_id": -1}).limit(1).toArray();

        }
        //naming the received file for profile and avatar

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


                console.log(error);
            });

        if (req.params.id === undefined) {
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

        } else {

            let inserted = await MongoDBCollections.characters.updateOne({"character_name_slug": slug}, {
                $set: {
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
                    "character_interests": interests
                }
            });

        }




        res.writeHead(302, {
            'Location': '/characters/' + slug + '/profile'
        });
        res.end();


    } catch
        (error) {
        console.log(error);


        if (req.session.loggedIn !== undefined) {

            res.render("characters/edit_character_form", {
                "config": config,
                "language": language,
                "titlePartial": language.characters.newCharacter,
                "permissions": req.session.userPermissions,
                "level": req.session.level,
                "urlPartial": '/characters/new',
                "CKEPosition": 'comment',
                "errorText": error,
                "oldProfile": undefined
            });

        } else {

            res.writeHead(302, {
                'Location': '/'
            });
            res.end();

        }


    } finally {
        await MongoClient.close();
    }

});


module.exports = router;