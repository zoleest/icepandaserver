const express = require('express');
const router = express.Router();


// require language file
const config = require("../../config");
const language = require("../../languages/"+config.languageCode);
const Mongo = require('mongodb');
const bcrypt = require("bcryptjs");
const sanitize = require("mongo-sanitize");

// function that used to count the date difference to let the user create new characters
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}


router.get('/',function(req,res){


    //checks the session if user is logged if not, renders login form, else redirects to index page
    if(req.session.loggedIn === undefined){
        res.render('login/login_form',
            {
                "config": config,
                "language": language,
               "titlePartial": language.login.title,
                "urlPartial": '/login',
                'error' : null
            });
    }else{
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }

});

router.post('/', async function(req,res){

    //If not loggedin, process, else redirect
    if(req.session.loggedIn === undefined){
        //check username before process
        let usernameRegex = /^[a-zA-Z0-9]{3,32}$/;
        let username = sanitize(req.body.username.toLowerCase());
        let password = sanitize(req.body.password);
        let error = false;

        if(usernameRegex.test(username)){

            //connect to mongodb collection
            const MongoClient = new Mongo.MongoClient(config.mongoUrl);
            MongoClient.connect();
            const MongoDBCollection = {"users": MongoClient.db("IcePanda").collection("IcePandaUsers"), "characters": MongoClient.db("IcePanda").collection("IcePandaCharacters")};

            //Checks for the username, and get the password for validation
            let loginData = await MongoDBCollection.users.findOne({"username":username, registrationHash: { $exists: false }},{projection:{"password":1, "permissions": 1, "characters": 1, "registrationDate": 1, "level": 1}});

                if(loginData !== null){
                    let isPasswordCorrect = await bcrypt.compare(password, loginData.password);
                        if(isPasswordCorrect){
                            //Creating the session. characters ordered.
                            req.session.loggedIn = true;
                            req.session.userName = username;
                            req.session.userPermissions = loginData.permissions;
                            let characters = await MongoDBCollection.characters.find({"character_user_username": req.session.userName, "character_isactive": 1},{projection:{"character_name":1, "character_name_slug": 1 }}).toArray();
                            req.session.userCharacters = characters;
                            req.session.level = loginData.level;
                            let now = new Date();
                            let registerDate = new Date(Date.parse(loginData.registrationDate));
                            //+1 so player can start game with new character
                            req.session.userMonthSinceRegistration = monthDiff(registerDate, now);

                            //set the first character active

                            if(characters.length !== 0){
                                req.session.activeCharacter = {"slug": characters[0].character_name_slug, "name":  characters[0].character_name};
                            }

                            /*
                            res.render('login/login_success_character_choice');*/

                            res.writeHead(302, {
                                'Location': '/'
                            });
                            res.end();

                        }else{

                            error = true;

                        }
                }else{
                    error = true;

                }


        }else{
            error = true;
        }

        //If there is error display the - this time - only error

        if(error){
            res.render('login/login_form',
                {
                    "config": config,
                    "language": language,
                    "titlePartial": language.login.title,
                    "urlPartial": '/login',
                    'error' : language.login.loginUsernamePasswordError
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

