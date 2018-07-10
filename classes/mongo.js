const mongodb = require('mongodb');
const client = mongodb.MongoClient;

module.exports = class mongo {
    constructor () {
        this.__mongo_ip = "localhost";
        this.__mongo_port = "27017";
        this.__mongo_db = "webapde";
        
        this.__mongo_url = "mongodb://" + this.__mongo_ip + ":" + this.__mongo_port + "/" + this.__mongo_db;
    }

    custom (json) {
        this.__mongo_ip = ('ip' in json) ? json.ip : this.__mongo_ip;
        this.__mongo_port = ('port' in json) ? json.port : this.__mongo_port;
        this.__mongo_db = ('db' in json) ? json.db : this.__mongo_db;

        this.__mongo_url = "mongodb://" + this.__mongo_ip + ":" + this.__mongo_port + "/" + this.__mongo_db;
    }

    
    
    connect () {
        console.log("Valid DB:");
        console.log(this.__mongo_url);
        client.connect(this.__mongo_url, (err, db) => {
            if (err) throw err;
            console.log("webapde");
        });
    }
}