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
                    properties: MongoClient.db(config.databaseName).collection(config.databaseName + "Properties"),
                    characterFields: MongoClient.db(config.databaseName).collection(config.databaseName + "CharacterFields")
                };

            let characterById = await MongoDBCollections.characters.findOne({"character_name_slug": slug});

            if (characterById === null) throw "character_not_exist"

            let properties = await MongoDBCollections.properties.find({"property_id": {"$in": characterById.character_properties}}).toArray();

            let characterFields = await MongoDBCollections.characterFields.find().toArray();


            // if (characterFields === null) ;

            //if there are existing document, then render, else render all
            characterById.character_properties = properties;


            res.status(201).json({character: characterById, fields: characterFields});

        } catch (error) {
            console.log(error);
            res.status(400).json({error: error});

        } finally {
            await MongoClient.close();
        }

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


router.get(['/new', "/:id/edit"], async function (req, res) {

    try {
        if (req.session.loggedIn === undefined) throw "user_not_logged_in"

        //get id from query's slug
        let slug = req.params.id !== undefined ? sanitize(req.params.id) : "";
        //if session contains slug or admin, then render, else redirect to index

        if(req.path === "/new"){
            if (!((req.session.level + req.session.userMonthSinceRegistration > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator'))) throw "user_no_permission_to_new_character"

        }else{
            if (!((req.session.userCharacters.includes(slug) && slug === req.session.actualCharacter) || req.session.userPermissions.includes('administrator'))) throw "user_no_permission_to_edit"

        }

        let MongoCollection = {
            characterFields: MongoClient.db(config.databaseName).collection(config.databaseName + "CharacterFields"),
            characters: MongoClient.db(config.databaseName).collection(config.databaseName + "Characters")
        };

        MongoClient.connect();

        let character = await MongoCollection.characters.findOne({'character_name_slug': slug});

        let profileFields = await MongoCollection.characterFields.find().toArray();

        if(character !== null){
        for(let profileFieldsIteral = 0; profileFieldsIteral < profileFields.length; profileFieldsIteral++){

               profileFields[profileFieldsIteral]['previousValue'] = character[profileFields[profileFieldsIteral].fieldName];



        }}

        res.status(201).json({fields: profileFields, slug: slug});

    } catch (error) {
        console.log(error);

        res.status(400).json({"error": error});

    } finally {
        MongoClient.close();
    }


});



router.post(['/new', '/:id/edit'], async function (req, res) {

    let sexualityArray = ['heterosexual', "homosexual", "bisexual", "asexual", "other"];

    await MongoClient.connect();
    const MongoDBCollections = {
        'users': MongoClient.db(config.databaseName).collection(config.databaseName + "Users"),
        'characters': MongoClient.db(config.databaseName).collection(config.databaseName + "Characters")
    };

    try {
        //if logged in, continue, else redirect to index
        if (req.session.loggedIn === undefined) throw "user_not_logged_in"

        if(req.path === "/new"){
            if (!((req.session.level + req.session.userMonthSinceRegistration > req.session.userCharacters.length) || req.session.userPermissions.includes('administrator') || req.session.userPermissions.includes('moderator'))) throw "user_no_permission_to_new_character"

        }else{
            if (!((req.session.userCharacters.includes(slug) && slug === req.session.actualCharacter) || req.session.userPermissions.includes('administrator'))) throw "user_no_permission_to_edit"

        }

        // Get variables from POST data
        let name = req.body.Json.name!==undefined?sanitize(req.body.Json.name):req.session.activeCharacter.character_name;
        let nicknames = sanitize(req.body.Json.nicknames);

        let isValidDate = Date.parse(req.body.Json.birthday);
        if (isNaN(isValidDate)) throw "birtday_error"
        let birthday = sanitize(req.body.Json.birthday);

        let species = sanitize(req.body.Json.species);

        if (!sexualityArray.includes(sanitize(req.body.Json.sexuality))) throw "sexuality_error";
        let sexuality = sanitize(req.body.Json.sexuality);

        if (!((req.body.Json.sex === 'male' || req.body.Json.sex === 'female'))) throw "sex_error";
        let sex = sanitize(req.body.Json.sex);

        let weapons = [];
        let abilities = [];

        let story = sanitize(req.body.Json.story);
        let interests = sanitize(req.body.Json.interests);

        let profile_picture = sanitize(req.body.Json.profile_picture);
        if (profile_picture===undefined||!profile_picture.startsWith('data:image/jpeg;base64')) throw "profile_picture_error"

        let slug = name.replace(' ', '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let xp = config.defaultCharacterXP;


        for (let weaponsIteral = 0; weaponsIteral < config.maxWeaponAndAbility; weaponsIteral++) {
            if (req.body.Json['weapon_name_' + weaponsIteral] !== undefined && req.body.Json['weapon_name_' + weaponsIteral] !== '' && req.body.Json['weapon_description_' + weaponsIteral] !== undefined && req.body.Json['weapon_description_' + weaponsIteral] !== '') {
                weapons.push({
                    "weapon_name": sanitize(req.body.Json['weapon_name_' + weaponsIteral]),
                    "weapon_description": sanitize(req.body.Json['weapon_description_' + weaponsIteral])
                });
            }
        }

        for (let abilitiesIteral = 0; abilitiesIteral < config.maxabilityAndAbility; abilitiesIteral++) {
            if (req.body.Json['ability_name_' + abilitiesIteral] !== undefined && req.body.Json['ability_name_' + abilitiesIteral] !== '' && req.body.Json['ability_description_' + abilitiesIteral] !== undefined && req.body.Json['ability_description_' + abilitiesIteral] !== '') {
                abilities.push({
                    "ability_name": sanitize(req.body.Json['ability' + abilitiesIteral]),
                    "ability_description": sanitize(req.body.Json['ability_description' + abilitesIteral])
                });
            }
        }


        //Check for existing user
        let existingCharacterByName = await MongoDBCollections.characters.findOne({"character_name": name}, {projection: {"character_id": 1}});

        if (existingCharacterByName !== null && req.params.id === undefined) throw "existing_character";

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
                "character_nicknames": nicknames,
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

                MongoDBCollections.users.updateOne({"username": req.session.userName}, {$push: {"characters": slug}}).then(() => {
                    MongoClient.close();
                });

                req.session.userCharacters.push({"character_name": name, "character_name_slug": slug});
                req.session.activeCharacter = {"name": name, "slug": slug};

                res.status(201).json({redirectTo: slug});
            }

        } else {

            let inserted = await MongoDBCollections.characters.updateOne({"character_name_slug": slug}, {
                $set: {
                    "character_nicknames": nicknames,
                    "character_birthday_date": birthday,
                    "character_species": species,
                    "character_sexuality": sexuality,
                    "character_sex": sex,
                    "character_weapons": weapons,
                    "character_abilities": abilities,
                    "character_story": story,
                    "character_interests": interests
                }
            }).then(() => {
                MongoClient.close();
            });

            res.status(201).json({redirectTo: slug});
        }

    } catch
        (error) {

        console.log(error);
        res.status(400).json({error: error})

    }

});


module.exports = router;