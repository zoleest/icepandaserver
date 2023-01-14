const express = require('express');
const router = express.Router();

//require language files
const emailTemplate = require("../../mail_templates/activation-email");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const Mongo = require('mongodb');
const config = require('../../config');
const language = require('../../languages/' + config.languageCode);
const sanitize = require('mongo-sanitize');


const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});


//With GET method render the form
router.get('/', function (req, res) {

    //redirect to index if already logged in
    if (req.session.loggedIn === undefined) {
        res.render('registration/registration_success', {
            "config": config,
            "language": language,
            "titlePartial": language.registration.title,
            "urlPartial": '/registration',
            "error": null
        });
    } else {

        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }
});

//With POST method render error or success page
router.post('/', async function (req, res) {

        let username = sanitize(req.body.username.toLowerCase())
        let password = sanitize(req.body.password);
        let confirmation = sanitize(req.body.confirmation);
        let email = sanitize(req.body.email.toLowerCase());
        let ipaddress = sanitize(req.socket.remoteAddress);

        //redirect to index if already logged in
        if (req.session.loggedIn === undefined) {


            //Return value is true default, else contains error code
            let usernameRegex = /^[a-zA-Z0-9]{3,32}$/;
            let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            //Try to validate data
            try {
                //Connect the client to Collection
                MongoClient.connect();
                const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Users");

                //First test user with Regexp
                if (!usernameRegex.test(username)) throw  language.registration.wrongUsernameFormat;

                //If valid, check if password is long enough
                if (!password.length >= 8) throw language.registration.wrongPasswordLength;

                //Checks if password and confirmation has the same length, if it has, then check if they are the same.
                if (!(password.length === confirmation.length && password === confirmation)) throw language.registration.passwordMismatch;

                //Test e-mail with Regex, only changes return if not true
                if (!emailRegex.test(email)) throw language.registration.wrongEmailFormat;

                // First check the userName
                try {
                    const existingUserName = await MongoDBCollection.findOne({"username": username}, {projection: {"username": 1}});
                    if (existingUserName !== null) throw language.registration.existingUser;
                } catch (error) {
                    throw error;
                }
                //If okay, then continue else render error


                // Check email
                try {
                    let existingEmail = await MongoDBCollection.findOne({"email": email}, {projection: {"email": 1}});
                    if (existingEmail !== null) throw language.registration.existingEmail;
                } catch (error) {
                    throw error;
                }
                //If okay, then continue else render error


                //get DateTime
                let DateTime = new Date().toLocaleString();

                //generate the activation key

                let activationKey = bcrypt.hashSync(username + email, 10);

                try {

                    let isRegistrationSuccess = await MongoDBCollection.insertOne({
                        "username": username,
                        "password": bcrypt.hashSync(password, 10),
                        "email": email,
                        "registrationDate": DateTime,
                        "registrationIpaddress": ipaddress,
                        "permissions": ["subscriber"],
                        "registrationHash": activationKey,
                        "level": 1
                    });

                    //If okay, render success, else render error
                    if (isRegistrationSuccess !== null) {

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


                        /* transporter.sendMail(mailOptions, function (error, info) {
                             if (error) {
                                 console.log(error);
                             } else {
                                 console.log('Email sent: ' + info.response);
                             }
                         });*/

                        res.render('registration/registration_form', {
                            "config": config,
                            "language": language,
                            "titlePartial": language.registration.title,
                            "urlPartial": '/registration'
                        });


                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                res.render('registration/registration_form', {
                    "config": config,
                    "language": language,
                    "titlePartial": language.registration.title,
                    "urlPartial": '/registration',
                    "error": error
                });

            } finally {
                await MongoClient.close();
            }


        } else {
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        }
    }
);


router.get('/activation', async function (req, res, next) {


    try {
        //get the activation key from the query
        if (req.query.key === undefined) throw "error";
        let activationKey = sanitize(req.query.key);

        //Make connection to MongodDB

        //Connect the client to Collection
        const MongoClient = new Mongo.MongoClient(config.mongoUrl, {useNewUrlParser: true});
        MongoClient.connect();
        const MongoDBCollection = MongoClient.db(config.databaseName).collection(config.databaseName + "Users");

        let isActivationKeyExist = await MongoDBCollection.findOne({"registrationHash": activationKey}, {userName: 1});
        if (isActivationKeyExist === null || activationKey === "") throw "error";

        MongoDBCollection.updateOne({"registrationHash": activationKey}, {$unset: {registrationHash: 1}});
        res.render('registration/activation_success', {
            "config": config,
            "language": language,
            "titlePartial": language.registration.activationTitle,
            "urlPartial": '/registration/activation'
        });

    } catch (error) {
        res.render('registration/activation_error', {
            "config": config,
            "language": language,
            "titlePartial": language.registration.activationTitle,
            "urlPartial": '/registration/activation'
        });
    } finally {
        MongoClient.close();
    }


});


module.exports = router;