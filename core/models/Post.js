const Mongo = require('./Mongo');
const ObjectId = require('mongodb').ObjectID;
const config = require('../../config')

module.exports = {

  /**
   * Returns a Promise that will contain an array of posts object
   * @param {Object} query - the query used to filter out posts
   * @param {Object} sort  - the parameters used to sort posts from ascending 
   * to descending
   * @param {number} limiter - the number of posts to return (0 means no limit)
   * @param {number} skip - the number of posts to skip from the start 
   * of the result
   */
  get_posts(query = {}, sort = {
    time: -1,
    likes: -1,
  }, limiter = 0, skip = 0) {
    return new Promise((resolve, reject) => {
      if (query.uid && query.uid.length < 24)
        resolve([]);
      else if (query.uid)
        query.uid = ObjectId(query.uid);

      if (query._id && query._id.length < 24)
        resolve([]);
      else if (query._id)
        query._id = ObjectId(query._id);

      Mongo.Post
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limiter)
        .exec((err, res) => {
          resolve(res)
        })
    });
  },

  /**
   * Returns a Promise that will contain an array of posts
   * ordered by time (descending by default).
   * @param {Object} query - the query used to filter out posts
   * @param {boolean} desc - dictates whether the posts are in ascending 
   * or descending order (default: true)
   * @param {number} limiter - the number of posts to return (0 means no limit)
   * @param {number} skip - the number of posts to skip from the start
   * of the result
   */
  get_posts_time(query = {}, desc = true, limiter = 0, skip = 0) {
    return this.get_posts(query, {
      time: (desc) ? -1 : 1,
      likes: (desc) ? -1 : 1,
    }, limiter, skip);
  },

  /**
   * Returns a Promise that will contain an array of posts
   * filtered out by a specific user and ordered by time 
   * (descending by default)
   * @param {string} user_id  - the user's primary id
   * @param {boolean} desc - dictates whether the posts are in ascending
   * or descending order (default: true)
   * @param {number} limiter - the number of posts to return (0 means no limit)
   * @param {number} skip - the number of posts to skip from the start
   * of the result
   */
  get_posts_user(user_id = "", desc = true, limiter = 0, skip = 0) {
    return this.get_posts({
      uid: user_id
    }, {
      time: (desc) ? -1 : 1,
      likes: (desc) ? -1 : 1,
    }, limiter, skip);
  },

  /**
   * Returns a Promise that will contain an array of posts
   * filtered out by each word in 'query'. The post's title is used
   * in the filtering.
   * @param {string} query - the string containing the various
   * words to find
   * @param {boolean} desc - dictates whether the posts are in ascending
   * or descending order (default: true)
   * @param {number} limiter - the number of posts to return (0 means no limit)
   * @param {number} skip - the number of posts to skip from the start
   */
  get_posts_search(query = "", desc = true, limiter = 0, skip = 0) {
    let strings = query.replace(/\s+/, " ").split(" ");
    let queries = [];

    strings.forEach(elem => {
      queries.push({
        title: new RegExp(elem, "gi")
      });
    });

    return this.get_posts({
      $or: queries
    }, {
      time: (desc) ? -1 : 1,
      likes: (desc) ? -1 : 1,
    }, limiter, skip);
  },

  /**
   * 
   * @param {string[]} tags 
   * @param {boolean} desc 
   * @param {number} limiter 
   * @param {number} skip 
   */
  get_posts_tag(tags = [], desc = true, limiter = 0, skip = 0) {
    return this.get_posts({
      tags: {
        $in: tags
      }
    }, {
      time: (desc) ? -1 : 1,
      likes: (desc) ? -1 : 1,
    }, limiter, skip);
  },

  get_random_tag(desc = true) {
    return new Promise((res, rej) => {
      Mongo.Post.countDocuments().exec((err, count) => {
        let random = Math.floor(Math.random() * count)

        let random_post = this.get_posts({}, {
          time: (desc) ? -1 : 1,
          likes: (desc) ? -1 : 1,
        }, 1, random)

        random_post.then((post) => {
          let random_tag = Math.floor(Math.random() * post[0].tags.length)

          res(post[0].tags[random_tag])
        })
      })
    })
  },

  /**
   * Creates a post based on the object passed onto the function
   * and inserts it into the database. Returns a Promise that will contain
   * an object dictating the status of the transaction.
   * @param {Object} json - the post object
   * @param {Object} json.user - the poster's primary id
   * @param {string} json.post - the link/url/path of the post's image
   * @param {string} json.title - the title of the post
   * @param {string[]} json.tags - the various tags associated with the post
   */
  create(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        post: '', // the fields
        title: '', // requirements
        user: '', // were not met

        exists: false, // an error existed
        server: false, // error occured when connecting to MongoDB
        db: false // error occured when using the database
      }

      if (!json.user) {
        errors.exists = true
        errors.user = "You must be logged in to post"

        resolve(errors)
      }

      if (!json.post) {
        errors.exists = true;
        errors.post = "A post is required";

        resolve(errors)
      }

      if (!json.title || (json.title && json.title.replace(/s+/g, "").length <= 0)) {
        errors.exists = true;
        errors.title = "A title is requried";
      }

      if (!json.tags || (json.tags && json.tags.length <= 0)) {
        errors.exists = true;
        errors.tags = "Post must have at least one tag";
      }

      if (!errors.exists) {
        Mongo.User.findById(json.user, (err, res) => {
          if (err) {
            errors.exists = true
            errors.db = true
          } else {
            if (!res) {
              errors.exists = true
              errors.user = "You must be logged in to post a meme"

              resolve(res)
            } else {
              json.uid = ObjectId(res._id)
              json.user = res.username

              Mongo.Post.create(json, (err, res) => {
                if (err) {
                  errors.exists = true
                  errors.db = true
                }

                console.log(res)
                resolve(res)
              })
            }
          }
        })
      } else
        resolve(errors)
    });
  },

  update_stats(uid, pid) {
    return new Promise((resolve, reject) => {
      let errors = {
        uid: "",
        pid: "",
        exists: false,
        server: false,
        db: false,
      }

      if (!uid) {
        errors.exists = true
        errors.uid = "Log in to like/dislike post"

        resolve(errors)
      }

      if (!pid) {
        errors.exists = true
        errors.pid = "Invalid post id"

        resolve(errors)
      }

      Model.User.findById(uid, (err, user) => {
        if (err) {
          errors.exists = true
          errors.db = true

          resolve(errors)
        } else {
          if (!res) {
            errors.exists = true
            errors.uid = "You must be logged in to like/dislike a post"

            resolve(errors)
          } else {
            Mode.Post.findById(pid, (err, post) => {
              if (err) {
                errors.exists = true
                errors.db = true

                resolve(errors)
              } else {
                if (!res) {
                  errors.exists = true
                  errors.uid = "Post does not exist"

                  resolve(errors)
                } else {
                  let like = false

                  if (user.uid in post.likers) {
                    like = true
                  }

                  if (like) {
                    post.likers.push(user._id)
                    post.likes += 1
                  } else {
                    post.likers.splice(post.likers.indexOf(user._id, 1))
                    post.likes -= 1
                  }

                  post.save((err, updated) => {
                    if (err) {
                      errors.exists = true
                      errors.db = true
                    }

                    resolve(errors)
                  })
                }
              }
            })
          }
        }
      })
    })
  },

  /**
   * 
   * @param {Object} json 
   * @param {string} json.uid
   * @param {string} json.pid
   */
  delete(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        user: '',
        post: '',
        exists: false,
        db: false,
        server: false,
      }

      if (!json.uid) {
        errors.exists = true
        errors.user = "You must be logged in to delete a post"
      }

      if (!json.pid) {
        errors.exists = true
        errors.post = "Invalid post to delete"
      }

      if (!errors.exists) {
        cnx.client((err, server) => {
          if (err) {
            errors.exists = true
            errors.server = true

            resolve(errors)
          }
          let dbo = db.db(config.db.mongo_db)

          dbo.collection('posts').findOne({
            _id: ObjectId(json.pid.toString()),
            user: ObjectId(json.uid.toString()),
          }).then((result) => {
            if (!result) {
              errors.exists = true
              errors.user = "You do not own this post"

              resolve(errors)
            } else {
              dbo.collection('posts').deleteOne({
                _id: ObjectId(json.pid.toString()),
                user: ObjectId(json.uid.toString()),
              }, (err, obj) => {
                if (err) {
                  errors.exists = true
                  errors.db = true
                }

                resolve(errors)
              })
            }
          })
        })
      } else
        resolve(errors)

    })
  },

  /**
   * 
   * @param {Object} json 
   * @param {string} json.uid
   * @param {string} json.pid
   * @param {Object} json.edit
   */
  edit(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        user: '',
        post: '',
        edit: '',
        exists: false,
        db: false,
        server: false,
      }

      if (!json.uid) {
        errors.exists = true
        errors.uid = "You must be logged in to edit this post"
      }

      if (!json.pid) {
        errors.exists = true
        errors.pid = "Invalid post to edit"
      }

      if (!json.edit) {
        errors.exists = true
        errors.edit = "You don't have anything to change"
      }

      if (!errors.exists) {
        for (let i = 0; i < Object.keys(json.edit).length; i++)
          if (!(Object.keys(json.edit)[i] in ['tags', 'title']))
            delete json.edit[Object.keys(json.edit)[i]]

        cnx.client((err, server) => {
          if (err) {
            errors.exists = true
            errors.server = true

            resolve(errors)
          } else {
            let dbo = server.db(config.db.mongo_db)

            dbo.collection('posts').findOne({
              _id: ObjectId(json.pid.toString()),
              user: ObjectId(json.uid.toString()),
            }).then((res) => {
              if (!res) {
                errors.exists = true
                errors.post = "You do not own this post"

                resolve(errors)
              } else {
                dbo.collection('posts').updateOne({
                  _id: ObjectId(json.pid.toString()),
                  user: ObjectId(json.uid.toString()),
                }, {
                  $set: json.edit
                }, (err, result) => {
                  if (err) {
                    errors.exists = true
                    errors.db = true
                  }

                  resolve(errors)
                })
              }
            })
          }
        })
      } else
        resolve(errors)

    })
  },

}