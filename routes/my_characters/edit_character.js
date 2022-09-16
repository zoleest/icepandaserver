const express = require("express");
const router = express.Router();
const sanitize = require("mongo-sanitize");
const Mongo = require('mongodb');
const config = require("../../config");

const language = require("../../languages/"+config.languageCode);
const fs = require('fs');
const sharp = require('sharp');


router.get('/', function(req,res){


    //checks if logged in or not. If not redirect to index
    if(req.session.loggedIn !== undefined) {


        //get id from query's slug
        let slug = sanitize(req.query.id);
        //if session contains slug or admin, then render, else redirect to index

        if((req.session.userCharacters.includes(slug)&& slug === req.session.actualCharacter) || req.session.userPermissions.includes('administrator')){

            res.render("my_characters/edit_character_form", {"character": slug});
        }else{
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }

    }else{
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }

});

router.post('/', function(req, res){

    //if logged in, continue, else redirect to index
    if(req.session.loggedIn !== undefined){
        //get id from query's slug
        let slug = sanitize(req.body.id);
        //if session contains slug or admin, then render, else redirect to index

        if(req.session.userCharacters.includes(slug) || req.session.userPermissions.includes('administrator')){


                // Get variables from POST data
            let nickname = sanitize(req.body.nickname);
            let birthday = sanitize(req.body.birthday);
            let species = sanitize(req.body.species);
            let gender = sanitize(req.body.gender);
            let sex = sanitize(req.body.sex);
            let weapons = [];
            let abilities = [];
            let story = sanitize(req.body.story);
            let interests = sanitize(req.body.interests);
            let profile_picture = sanitize(req.body.profile_picture);


            req.body.weapon_name.forEach(function(value, index){
                if(req.body.weapon_name[index] !== undefined && req.body.weapon_name[index] !== '' && req.body.weapon_description[index] !== undefined && req.body.weapon_description[index] !== '' ){
                    weapons.push({"weapon_name": sanitize(req.body.weapon_name[index]),"weapon_description": sanitize(req.body.weapon_description[index])  })
                }
            });

            req.body.ability_name.forEach(function(value, index){
                if(req.body.ability_name[index] !== undefined && req.body.ability_name[index] !== '' && req.body.ability_description[index] !== undefined && req.body.ability_description[index] !== '' ){
                    abilities.push({"ability_name": sanitize(req.body.ability_name[index]),"ability_description": sanitize(req.body.ability_description[index])  })
                }
            });


            //connect to mongodb collection
            const MongoClient = new Mongo.MongoClient(config.mongoUrl);
            MongoClient.connect();
            const MongoDBCollection = MongoClient.db("IcePanda").collection("IcePandaCharacters");

            //Check for existing user
            //naming the received file for profile and avatar
                        let filename = name.toLowerCase().replace(" ","_")+".webp" ;
                        //getting the image data by splitting
                        let parts = profile_picture.split(';');
                        let mimType = parts[0].split(':')[1];
                        let imageData = parts[1].split(',')[1];


                        //Resize to configured profile size
                        var img = new Buffer(imageData, 'base64');
                        sharp(img)
                            .resize(config.profilePictureSize,config.profilePictureSize)
                            .toBuffer()
                            .webp({ lossless: true })
                            .then(resizedImageBuffer => {
                                let resizedImageData = resizedImageBuffer.toString('base64');


                                let resizedBase64 = `${resizedImageData}`;
                                let path = __dirname + "../../../public/images/profile_pictures/" + filename;

                                //write the profile picture
                                fs.writeFile(path, resizedBase64, 'base64', function(){

                                });

                            })
                            .catch(error => {
                                // error handling
                                res.send(error)
                            });




                        //Resize to configured avatar size
                        sharp(img)
                            .resize(config.avatarPictureSize,config.avatarPictureSize)
                            .toBuffer()
                            .webp({ lossless: true })
                            .then(resizedImageBuffer => {
                                let resizedImageData = resizedImageBuffer.toString('base64');


                                let resizedBase64 = `${resizedImageData}`;
                                let path = __dirname + "../../../public/images/avatars/" + filename;

                                //write the profile picture
                                fs.writeFile(path, resizedBase64, 'base64', function(){

                                });

                            })
                            .catch(error => {
                                // error handling
                                res.send(error)
                            });


                        //update database
                        MongoDBCollection.updateOne({'character_name_slug': slug},{$set:{
                            "character_nicknames": nickname,
                            "character_birthday_date": birthday,
                            "character_species": species,
                            "character_gender": gender,
                            "character_sex": sex,
                            "character_weapons:": weapons,
                            "character_abilities": abilities,
                            "character_relationships": [],
                            "character_properties":[],
                            "character_story": story,
                            "character_interests": interests,
                            "character_isactive": 1

                        }});


                }else{

                    res.writeHead(302, {
                        'Location': '/'
                    });
                    res.end();

                }

        }else{

            res.writeHead(302, {
                'Location': '/'
            });
            res.end();

        }


});


module.exports = router;