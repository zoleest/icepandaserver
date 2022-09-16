const express = require('express');
const Mongo = require("mongodb");
const config = require("../../config");
const router = express.Router();
const sanitize = require("mongo-sanitize");
const language = require("../../languages/"+config.languageCode);

//connect to mongodb collection
const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = {"users": MongoClient.db("IcePanda").collection("IcePandaUsers"), "coupons":MongoClient.db("IcePanda").collection("IcePandaCoupons")};

//
router.get('/', async function(req, res){

    //checks if user is logged in, or transfer to error page
    if(req.session.loggedIn !== undefined) {

        let code = sanitize(req.query.code);
        let userName = req.session.userName;
        //check if coupon is in the url
        if(code !== undefined){

            //Check if coupon exist, and if so, get the data, else throw error
            let couponData = await MongoDBCollection.coupons.findOne({"coupon_code": code, "coupon_used": 0 },{projection: {"coupon_type": 1}});

            if(couponData !== null){
                                //switch on the type
                switch(couponData.coupon_type){
                    case 'level_up':
                        //Make the coupon used, and upgrade user's level;
                        MongoDBCollection.coupons.updateOne({ "coupon_code": code}, {$set:{"coupon_used": 1, "coupon_used_by": userName}} );
                        MongoDBCollection.users.updateOne({ "username": userName}, {$inc:{"level": 1}} );
                        break;

                    case 'watcher':
                        //Make the coupon used, and upgrade user's privilegue;
                        MongoDBCollection.coupons.updateOne({ "coupon_code": code}, {$set:{"coupon_used": 1, "coupon_used_by": userName}} );
                        MongoDBCollection.users.updateOne({ "username": userName}, {$push:{"permissions": "watcher"}} );
                        break;

                    case 'plus5':

                        //Make the coupon used, and upgrade user's level;
                        MongoDBCollection.coupons.updateOne({ "coupon_code": code}, {$set:{"coupon_used": 1, "coupon_used_by": userName}} );
                        MongoDBCollection.users.updateOne({ "username": userName}, {$inc:{"level": 5}} );




                }

                res.render("coupons/success");

            }else{

                res.render("coupons/coupon_error")

            }


        }else{

            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }

    }else{

        res.render('coupons/login_error');


    }


});


module.exports = router;