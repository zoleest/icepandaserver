const Mongo = require("mongodb");
const config = require("./config");
const sanitize = require("mongo-sanitize");


const MongoClient = new Mongo.MongoClient(config.mongoUrl);
MongoClient.connect();
const MongoDBCollection = MongoClient.db("IcePanda").collection("IcePandaChat");

const chat = {}

chat.insertMessage = async function (message){

    let name = sanitize(message.name);
    let messageText = sanitize(message.message);
    let dateTime = new Date().toLocaleString();

    return await MongoDBCollection.insertOne({"name": name, "date": dateTime, "message": messageText});

};

chat.lastMessages = async function(){

    let result = await MongoDBCollection.find('',{projection:{'_id': 0}}).sort({"date": -1}).limit(5);
    return await result.toArray();

};

module.exports = chat;