const express = require('express');
const router = express.Router();
const Mongo = require("mongodb");
const config = require("../../config");

const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
MongoClient.connect();
const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName+"Comments");

/* GET json */
router.get('/', async function (req, res, next) {

    //get the 3 days ago date
    let previousDateTime = new Date();
    previousDateTime.setDate(previousDateTime.getDate() - 3);
    let localeTime = previousDateTime.toLocaleString();
    //get pages form database
    let commentedpages = await MongoDBCollection.aggregate([
        {
            '$match': {
                'comment_date': {
                    '$gt': localeTime
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

    //get characters for pages form database
    let charactersArray = [];

    for (let pageArrayCounter = 0; pageArrayCounter < commentedpages.length; pageArrayCounter++) {

        let pageSlug = commentedpages[pageArrayCounter]._id.replace(/ /g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let characters = await MongoDBCollection.aggregate(
            [
                {
                    '$match': {
                        'comment_page': pageSlug,
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

        charactersArray.push({"slug": pageSlug, "characters": characters});
    }

    //get last comment data
    let lastComment = await MongoDBCollection.findOne({}, {
        sort: {"comment_date": -1},
        projection: {"comment_date": 1}
    });

    res.json({
        "pages": commentedpages,
        "details": charactersArray,
        "lastCommentDate": lastComment.comment_date
    });

});

module.exports = router;
