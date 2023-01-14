const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");

const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
MongoClient.connect();
const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Comments");


/*Function to get the oldest date for displayed comments*/
function getPreviousDate(){

    let previousDateTime = new Date();
    previousDateTime.setDate(previousDateTime.getDate() - config.recentCommentsDays);
    return previousDateTime.toLocaleString();

}

/* GET json */
router.get('/locations', async function (req, res, next) {

    //get the 3 days ago date

    //get locations form database

    try {
        let commentedLocations = await MongoDBCollection.aggregate([
            {
                '$match': {
                    'comment_date': {
                        '$gt': getPreviousDate()
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
                                '$gt': getPreviousDate()
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
    }catch(error){
        console.log(error);

    }




});



router.get('/pages', async function (req, res, next) {

   //get pagess form database

    try {
        let commentedPages = await MongoDBCollection.aggregate([
            {
                '$match': {
                    'comment_date': {
                        '$gt': getPreviousDate()
                    },
                    'comment_page_name': {
                        '$gt': ''
                    }
                }
            }, {
                '$group': {
                    '_id': '$comment_page_name',
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

        //get characters for locations form database
        let charactersArray = [];



        for (let pageArrayCounter = 0; pageArrayCounter < commentedPages.length; pageArrayCounter++) {

            let pageSlug = commentedPages[pageArrayCounter]._id.replace(/ /g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let characters = await MongoDBCollection.aggregate(
                [
                    {
                        '$match': {
                            'comment_page': pageSlug,
                            'comment_date': {
                                '$gt': getPreviousDate()
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

            charactersArray.push({"slug": pageSlug, "characters": characters});
        }

        //get last comment data
        let lastComment = await MongoDBCollection.findOne({}, {
            sort: {"comment_date": -1},
            projection: {"comment_date": 1}
        });

        res.json({
            "pages": commentedPages,
            "details": charactersArray,
            "lastCommentDate": lastComment.comment_date
        });
    }catch(error){
        console.log(error);

    }




});



/* GET json */
router.get('/last-comment', async function (req, res, next) {
    //get last comment data
    try{
        let lastComment = await MongoDBCollection.findOne({}, {
            sort: {"comment_date": -1},
            projection: {"comment_date": 1}
        });
        res.json({"lastCommentDate": lastComment.comment_date});
    }catch(error){
        console.log(error);
    }



});




module.exports = router;
