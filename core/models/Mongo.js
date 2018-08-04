const config = require('../../config')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * Set up and connect to MongoDB
 */
const mongo_url = process.env.MONGODB_URI ||
  "mongodb://" + ((config.db.mLab) ? config.db.mLab + "@" : "") + config.db.mongo_ip + ":" + config.db.mongo_port + "/" + config.db.mongo_db
const connection = mongoose.connect(mongo_url, config.db.opt)

// Account Schema
const UserSchema = new Schema({
  username: String,
  password: String,
  name: String,
  img: {
      type: String,
      default: '/img/samples/sample_profile.jpg',
  },
})

// Post Schema
const PostSchema = new Schema({
  title: String,
  likes: {
    type: Number,
    default: 0
  },
  uid: ObjectId,
  user: String,
  tags: Array,
  likers: Array,
  post: String,
  time: {type: Date, default: Date.now}
})

// Create Schemas
module.exports.Connection = connection
module.exports.User = mongoose.model('Users', UserSchema)
module.exports.Post = mongoose.model('Posts', PostSchema)
module.exports.ObjectId = mongoose.Types.ObjectId