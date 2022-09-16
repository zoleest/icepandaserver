const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize');
const config = require('../../config');


const language = require("../../languages/"+config.languageCode);
const Mongo = require("mongodb");
const nodemailer = require("nodemailer");
const emailTemplate = require("../../mail_templates/lost-password");

//connect Mongo
const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db("IcePanda").collection("IcePandaUsers");


router.get('/', function(req,res){

    //If not logged in, renders the form, if logged in, transfers to index page
    if(req.session.loggedIn !== true){
        res.render('login/lost_password_form',{
            "config": config,
            "language": language,
            "titlePartial": language.login.lostPasswordTitle,
            "urlPartial": '/lost-password'
        });
    }else{
        res.writeHead(302, {
            'Location': '/'
        });
    }

});

router.get('/new-password', async function(req,res){

    //get and sanitize the key, and password from POST

    let key = sanitize(req.query.key);


        //If not logged in, renders the form, if logged in, transfers to index page, also checks if key exist
        if(req.session.loggedIn !== true && key !== undefined){

         let userNameFromDatabase = await  MongoDBCollection.findOne({'lostpasswordkey': key}, {projection:{"username": 1}});

                if(userNameFromDatabase !== null){


                    res.render('login/new_password_form', {
                        "config": config,
                        "language": language,
                        "titlePartial": language.login.newPasswordTitle,
                        "urlPartial": '/lost_password/new_password',
                        "error": null,
                        "key": key

                    });

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

router.post('/', async function(req,res){

    //If not logged in, renders the form, if logged in, transfers to index page
    if(req.session.loggedIn !== true){

        //get and sanitize username, and generate key
        let username = sanitize(req.body.username.toLowerCase());
        let key = bcrypt.hashSync( username+ config.lostPasswordHashKey, 10);

        //insert hash to database
      MongoDBCollection.updateOne({"username": username},{$set:{"lostpasswordkey": key}});

        //get user's email
        let userMailArray = await MongoDBCollection.findOne({"username": username}, {projection:{"email": 1}});


        if(userMailArray !== null){


            //Sending out lost password mail with key
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.siteMail,
                    pass: config.siteMailPassword
                }
            });

            let mailOptions = {
                from: config.siteMailFrom,
                to: userMailArray.email,
                subject: language.login.lostPassMail + ' - ' + config.websiteName,
                html: emailTemplate(key)
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

        }

        res.render('login/lost_password_success');



    }else{
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }

});


router.post('/new-password', async function(req,res){

    //get key and password from POST
    let key = sanitize(req.body.key);
    let password = sanitize(req.body.password);
    let confirmation = sanitize (req.body.confirmation);
    let error = null;

    //if pass and confirm isn't the same
    if(password === confirmation){

         //If not logged in, renders the form, if logged in, transfers to index page
        if(req.session.loggedIn !== true){

            //get and sanitize username, and generate key
            let passwordHash = bcrypt.hashSync( password, 10);


            //get username from database
           let userNameFromDatabase = await MongoDBCollection.findOne({"lostpasswordkey":key}, {projection:{"username": 1}});

                //if we have result, insert
                if(userNameFromDatabase !== null){

                    //insert hash to database
                    MongoDBCollection.updateOne({"username": userNameFromDatabase.username},{$set:{"password": passwordHash}, $unset:{"lostpasswordkey": 1}}).then(function(result){

                        res.writeHead(302, {
                            'Location': '/'
                        });
                        res.end();


                    });

                }else{


                    error = language.login.newPasswordWrongKey;
                }





        }else{
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }
    }else{
        error = language.login.newPasswordNotMatchError;
    }


    if(error !== null) {
        res.render('login/new_password_form', {
            "config": config,
            "language": language,
            "titlePartial": language.login.newPasswordTitle,
            "urlPartial": '/lost_password/new_password',
            "error": error,
            "key": key

        });
    }

});


module.exports = router;