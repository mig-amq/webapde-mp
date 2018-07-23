const config = require('../../config')
const mongo = require('mongodb').MongoClient

module.exports = {
  mongo_url: process.env.MONGODB_URI ||
            "mongodb://" + ((config.db.mLab) ? config.db.mLab + "@" : "") + config.db.mongo_ip + ":" + config.db.mongo_port + "/" + config.db.mongo_db,
  
  client (cb) {
    return mongo.connect(this.mongo_url, config.db.opt, cb)
  }
}