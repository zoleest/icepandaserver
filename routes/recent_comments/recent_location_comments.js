const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");

const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName+"Comments");

/* GET json */
router.get('/', async function (req, res, next) {

    //get the 3 days ago date
    let previousDateTime = new Date();
    previousDateTime.setDate(previousDateTime.getDate() - 3);
    let localeTime = previousDateTime.toLocaleString();
    //get locations form database
    let commentedLocations = await MongoDBCollection.aggregate([
        {
            '$match': {
                'comment_date': {
                    '$gt': localeTime
                },
                'comment_location_name': {
                    '$gt': ''
                }
            }
        }, {
            '$group': {
                '_id': '$comment_location_name',
                'last_comment': {
                    '$last': '$comment_date'
                }
            }
        }, {
            '$sort': {
                'last_comment': -1
            }
        }]
    ).toArray();

    console.log(commentedLocations);
    //get characters for locations form database
    let charactersArray = [];

    for (let locationArrayCounter = 0; locationArrayCounter < commentedLocations.length; locationArrayCounter++) {

        let locationSlug = commentedLocations[locationArrayCounter]._id.replace(/ /g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let characters = await MongoDBCollection.aggregate(
            [
                {
                    '$match': {
                        'comment_location': locationSlug,
                        'comment_date': {
                            '$gt': localeTime
                        }
                    }
                }, {
                '$group': {
                    '_id': '$comment_character',
                    'last_comment': {
                        '$last': '$comment_date'
                    }
                }
            },
                {
                    '$sort': {
                        'last_comment': -1
                    }
                }
            ]
        ).toArray();

        charactersArray.push({"slug": locationSlug, "characters": characters});
    }

    //get last comment data
    let lastComment = await MongoDBCollection.findOne({}, {
        sort: {"comment_date": -1},
        projection: {"comment_date": 1}
    });

    res.json({
        "locations": commentedLocations,
        "details": charactersArray,
        "lastCommentDate": lastComment.comment_date
    });

});

/* GET json */
router.get('/last-comment', async function (req, res, next) {
    //get last comment data
    let lastComment = await MongoDBCollection.findOne({}, {
        sort: {"comment_date": -1},
        projection: {"comment_date": 1}
    });

    res.json({"lastCommentDate": lastComment.comment_date});

});

module.exports = router;
