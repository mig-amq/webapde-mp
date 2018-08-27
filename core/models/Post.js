const Mongo = require('./Mongo');

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
  get_posts(query = {}, sort = { time: -1, }, limiter = 0, skip = 0) {
    return new Promise((resolve, reject) => {
      if (query.uid && query.uid.length < 24)
        resolve([]);

      if (query._id && query._id.length < 24)
        resolve([]);

      Mongo.Post
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limiter)
        .lean()
        .exec((err, res) => {
          if (err) resolve([])
          
          resolve(res)
        })
    });
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
        title: {
          $regex: ".*" + elem + ".*",
          $options: "i",
        }
      });
    });

    queries.push({
      tags: {
        $in: strings
      }
    })

    return this.get_posts({
      $or: queries
    }, {
      time: (desc) ? -1 : 1,
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
    }, limiter, skip);
  },
  
  get_random_tag(desc = true) {
    return new Promise((res, rej) => {
      Mongo.Post.countDocuments().exec((err, count) => {
        let random = Math.floor(Math.random() * count)

        let random_post = this.get_posts({}, {
          time: (desc) ? -1 : 1,
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
              json.uid = Mongo.ObjectId(res._id)
              json.user = res.username

              Mongo.Post.create(json, (err, post) => {
                if (err) {
                  errors.exists = true
                  errors.db = true
                }

                Mongo.User.findByIdAndUpdate(res._id, {
                  $push: {
                    posts: post
                  }
                }, (err, res_user) => {
                  if (err) {
                    errors.exists = true
                    errors.db = true
                  }

                  resolve(post)
                })
              })
            }
          }
        })
      } else
        resolve(errors)
    });
  },

  /**
   * Updates the like status of a specific post.
   * @param {String|Object} uid the user's _id
   * @param {String|Object} pid the post's _id
   */
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

      Mongo.User.findById(uid, (err, user) => {
        if (err) {
          errors.exists = true
          errors.db = true

          resolve(errors)
        } else {
          if (!user) {
            errors.exists = true
            errors.uid = "You must be logged in to like/dislike a post"

            resolve(errors)
          } else {
            Mongo.Post.findById(pid, (err0, post) => {
              if (err0) {
                errors.exists = true
                errors.db = true

                resolve(errors)
              } else {
                if (!post) {
                  errors.exists = true
                  errors.uid = "Post does not exist"

                  resolve(errors)
                } else {
                  let liked = false

                  post.likers.forEach(el => {
                    if (el.toString() === user._id.toString())
                      liked = true
                  })

                  if (!liked) {
                    post.likers.push(user._id)

                    post.likes += 1
                  } else {
                    post.likers.splice(post.likers.indexOf(user._id, 1))
                    post.likes -= 1
                  }

                  post.save((err1, updated) => {
                    if (err1) {
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
   * Deletes a certain post from the db
   * @param {Object|String} uid the user's id (currently logged in)
   * @param {Object|String} pid the post's id
   */
  delete(uid, pid) {
    return new Promise((resolve, reject) => {
      let errors = {
        user: '',
        post: '',
        exists: false,
        db: false,
        server: false,
      }

      if (!uid) {
        errors.exists = true
        errors.user = "You must be logged in to delete a post"
      }

      if (!pid) {
        errors.exists = true
        errors.post = "Invalid post to delete"
      }

      if (!errors.exists) {
        Mongo.Post.findById(pid, (err, res) => {
          if (err) {
            errors.exists = true
            errors.db = true

            resolve(errors)
          } else if (!res) {
            errors.exists = true
            errors.post = "Can't find that post!"

            resolve(errors)
          } else {
            if (res._id.toString() === pid) {
              Mongo.Post.findByIdAndRemove(pid, (err, res) => {
                if (err) {
                  errors.exists = true
                  errors.db = true
                } else {
                  Mongo.User.findByIdAndUpdate(uid, {
                    $pull: {
                      posts: {
                        _id: pid,
                      }
                    }
                  }, (err, res0) => {
                    if (err) {
                      errors.exists = true
                      errors.db = true
                    }
                    
                    resolve(errors)
                  })
                }
              })
            } else {
              errors.exists = true
              errors.user = "Oops! You don't own that post"

              resolve(errors)
            }
          }
        })
      } else
        resolve(errors)

    })
  },

  /**
   * Edits a Post document in the db
   * @param {Object} json contains the constraints and properties to be updated
   * @param {string} json.uid the user's default id
   * @param {string} json.pid the post's default id
   * @param {Object} json.edit the properties to edit in the Post document, acceptable 
   * properties are tags (string array) and title (string)
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
          if (['tags', 'title', 'private', 'viewers'].indexOf(Object.keys(json.edit)[i]) <= -1)
            delete json.edit[Object.keys(json.edit)[i]]

        if (!json.edit.private || (json.edit.private && !json.edit.viewers))
          json.edit.viewers = []
          
        Mongo.Post.findOne({
          _id: json.pid,
          uid: json.uid,
        }, (err, res) => {
          if (err) {
            errors.exists = true
            errors.db = true
          } else {
            if (!res) {
              errors.exists = true
              errors.post = "Post does not exist"

              resolve(errors)
            } else {
              Mongo.Post.findByIdAndUpdate(res._id, json.edit, (err, res2) => {
                
                if (err) {
                  errors.exists = true
                  errors.db = true
                } else {
                  if (!res2) {
                    errors.exists = true
                    errors.post = "Post does not exist"
                  }
                }

                resolve(errors)
              })
            }
          }
        })
      } else
        resolve(errors)

    })
  },

}