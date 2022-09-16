const express = require('express');
const router = express.Router();

//require language files
const emailTemplate = require("../../mail_templates/activation-email");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const Mongo = require('mongodb');
const config = require('../../config');
const language = require('../../languages/'+config.languageCode);
const sanitize = require('mongo-sanitize');


//With GET method render the form
router.get('/', function(req, res) {

    //redirect to index if already logged in
    if(req.session.loggedIn === undefined){
        res.render('registration/registration_form',{
            "config": config,
            "language": language,
            "titlePartial": language.registration.title,
            "urlPartial": '/registration',
            "error": null
        });
    }else{

        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }
});

//With POST method render error or success page
router.post('/', async function(req, res) {

    let error = null;
    let username = sanitize(req.body.username.toLowerCase())
    let password = sanitize(req.body.password);
    let confirmation = sanitize(req.body.confirmation);
    let email = sanitize(req.body.email.toLowerCase());
    let ipaddress = sanitize(req.socket.remoteAddress);

    //redirect to index if already logged in
    if(req.session.loggedIn === undefined){
        //Connect the client to Collection
        const MongoClient = new Mongo.MongoClient(config.mongoUrl);
        MongoClient.connect();
        const MongoDBCollection = MongoClient.db("IcePanda").collection("IcePandaUsers");

        //Return value is true default, else contains error code
        let usernameRegex = /^[a-zA-Z0-9]{3,32}$/;
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        //First test user with Regexp
        if(usernameRegex.test(username)){

            //If valid, check if password is long enough
            if(password.length >= 8){

                //Checks if password and confirmation has the same length, if it has, then check if they are the same.
                if(password.length === confirmation.length && password === confirmation){

                    //Test e-mail with Regex, only changes return if not true
                    if(emailRegex.test(email)){


                        // First check the userName
                        let existingUserName =  await MongoDBCollection.findOne({"username": username},{projection:{"username":1}});

                        //If okay, then continue else render error
                        if(existingUserName === null){

                            // Check email
                            let existingEmail = await  MongoDBCollection.findOne({"email": email},{projection:{"email":1}});

                            //If okay, then continue else render error
                            if(existingEmail === null){


                                //get DateTime
                                let DateTime = new Date().toLocaleString();

                                //generate the activation key

                                let activationKey = bcrypt.hashSync(username+email, 10);


                                let isRegistrationSuccess = await MongoDBCollection.insertOne({"username": username, "password": bcrypt.hashSync(password, 10),"email": email, "registrationDate": DateTime, "registrationIpaddress": ipaddress, "permissions":["subscriber"], "registrationHash": activationKey, "level": 1});

                                //If okay, render success, else render error
                                if(isRegistrationSuccess !== null){

                                    //
                                    let transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: config.siteMail,
                                            pass: config.siteMailPassword
                                        }
                                    });

                                    let mailOptions = {
                                        from: config.siteMailFrom,
                                        to: email,
                                        subject: language.registration.activationMailTitle + ' - ' + config.websiteName,
                                        html: emailTemplate(activationKey)
                                    };


                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });


                                    res.render('registration/registration_success');

                                }else{

                                    error =  language.registration.unknownError;
                                }





                            }else{

                                error =  language.registration.existingEmail;

                            }




                        }else{

                            error = language.registration.existingUser;

                        }


                    }else{


                    error = language.registration.wrongEmailFormat;
                }

                }else{

                    error = language.registration.passwordMismatch;

                }

            }else{

                error = language.registration.wrongPasswordLength;

            }

        }else{

            error = language.registration.wrongUsernameFormat;

        }

        if(error !== null){
           res.render('registration/registration_form',{
                "config": config,
                "language": language,
                "titlePartial": language.registration.title,
                "urlPartial": '/registration',
                "error": error
            });
        }



    }else{
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }
});


module.exports = router;