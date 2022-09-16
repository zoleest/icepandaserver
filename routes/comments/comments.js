const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const router = express.Router();
const sanitize = require("mongo-sanitize");

const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = {"locations": MongoClient.db("IcePanda").collection("IcePandaLocations"), "comments": MongoClient.db("IcePanda").collection("IcePandaComments"), "characters": MongoClient.db("IcePanda").collection("IcePandaCharacters") };


router.post('/', async function(req, res){

    //Check if character chosen.
    if(req.session.activeCharacter !== undefined){
        //Get and sanitize input
        let characterName = req.session.activeCharacter.name;
        let characterSlug = req.session.activeCharacter.slug;
        let locationSlug = sanitize(req.body.location);
        let commentText = sanitize(req.body.comment);
        let DateTime = new Date().toLocaleString();

        // Check is user input exits
        if(locationSlug !== null && commentText !== null){

            //Check the database if user can comment there
            let location = await MongoDBCollection.locations.findOne({"location_slug": locationSlug, $or: [{"location_restricted_to": "0"}, {"location_restricted_to": characterSlug}]}, {projection:{"location_slug": 1, "location_name": 1}});

            //if can, insert comment to database
            if(location.length !== 0 && commentText.length !== 0){

                //If commentText length is greater than 500 character then give greater xp

                if(commentText.length <= 500){

                    MongoDBCollection.characters.updateOne( { "character_name_slug": characterSlug }, { $inc: { "character_xp": config.normalXpPerComment*req.session.level} });

                }else{


                    MongoDBCollection.characters.updateOne( { "character_name_slug": characterSlug }, { $inc: { "character_xp": config.biggerXpPerComment*req.session.level} });
                }

                MongoDBCollection.comments.insertOne({"comment_location_name": location.location_name, "comment_location": locationSlug,"comment_character": characterName, "comment_character_slug": characterSlug, "comment_date": DateTime, "comment_text": commentText });


                //after insert, redirect
                res.writeHead(302, {
                    'Location': '/locations?id='+locationSlug
                });
                res.end();

            }else{

                res.writeHead(302, {
                    'Location': '/locations'
                });
                res.end();
            }
        }else{

            res.writeHead(302, {
                'Location': '/locations'
            });
            res.end();


        }
    }else{

        res.writeHead(302, {
            'Location': '/locations'
        });
        res.end();


    }


});


module.exports = router;