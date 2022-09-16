const config = {

    //Site's language code:

    "languageCode" : "hu_hu",

    //Url for Mongo connection
    "mongoUrl": "mongodb://localhost:27017/",

    //Website name
    "websiteName": "Szerepjáték.net",

    //Website url
    "websiteURL": "https://szerpejatek.net",


    //Website image
    "websiteImg": "https://szerpejatek.net/noimg.webp",

    //Website description
    "websiteDescriton": "Szerepjáték.net - Magyarország legkirályabb szöveges szerepjáték oldala, ahol a történéseknek csak a képzeleted szabhat határt!",

    //Sessions secret value
    "sessionSecret": "FirePenguinDiscoPanda",
    //How many days the session keep alive
    "maxSessionDays": 3,

    //Uploaded profile picture size
    "profilePictureSize": 500,
    //Uploaded avatar size
    "avatarPictureSize": 100,

    //Default xp for characters
    "defaultCharacterXP": 1000,

    //Lost password hash key
    "lostPasswordHashKey" :  "jdsaélfjasdalskdjfsa",

    //Chat last x message
    "lastChatMessages" : 5,

    //Locations page limit
    "locationsPageLimit": 12,

    //Comments per page
    "commentPageLimit": 20,

    //Minimal character count for bigger xp
    "minCharacterCountForBiggerXp": 500,

    //Normal xp per comment
    "normalXpPerComment": 0.25,

    //Bigger xp per comment
    "biggerXpPerComment": 0.33,

    //Mailer adress and password
    "siteMail": "zoltan.halapi95@gmail.com",
    "siteMailPassword": "nhqgxklcrbqgwtlw",
    "siteMailFrom": "halapi.david@szerepjatek.net"


}

module.exports = config;

